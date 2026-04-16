/**
 * LLM assignments aggregator — MP-CONFIG-1 R8 (l9m-8).
 *
 * `GET /api/config/llm-assignments` fans out to each probabilistic organ's
 * `/introspect` endpoint, extracts the flat `llm` field contributed by
 * R5/R6/R7, and composes a platform-wide view. Bug #9 compliant (flat shape,
 * no nested envelope). Cached 30s in-memory to reduce probe load from the
 * OrganMonitoringPage 15s auto-refresh.
 *
 * Dependency injection: fetchImpl / nowImpl are optional overrides used by
 * unit tests. Production passes nothing — global fetch + Date.now().
 */

import { Router } from 'express';
import { PROBABILISTIC_ORGANS } from '../data/organs.js';

const FETCH_TIMEOUT_MS = 2000;
const CACHE_TTL_SECONDS = 30;
const CACHE_TTL_MS = CACHE_TTL_SECONDS * 1000;
const DEFAULT_GRAPH_URL = 'http://localhost:4020';
const COST_WINDOW_HOURS = 24;

async function fetchIntrospect(organ, fetchImpl) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetchImpl(`http://localhost:${organ.port}/introspect`, { signal: controller.signal });
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` };
    }
    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err.name === 'AbortError' ? 'timeout' : err.message };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Extract the flat `llm` field from an organ's /introspect response. The
 * organ-boot factory wraps the developer's introspectCheck() return value
 * inside an `extra: {...}` envelope (see shared-lib introspect router).
 * Accept both envelope-wrapped and already-flat shapes so the aggregator is
 * robust to shared-lib shape drift.
 */
function extractLlm(introspectPayload) {
  if (!introspectPayload || typeof introspectPayload !== 'object') return null;
  if (introspectPayload.llm) return introspectPayload.llm;
  if (introspectPayload.extra && introspectPayload.extra.llm) return introspectPayload.extra.llm;
  return null;
}

function buildOrganRecord(organ, probe) {
  const base = {
    organ_number: organ.num,
    organ_name: organ.name.toLowerCase(),
    port: organ.port,
  };
  if (!probe.ok) {
    return { ...base, status: 'unreachable', error: probe.error, llm: null };
  }
  const llm = extractLlm(probe.data);
  if (!llm) {
    return { ...base, status: 'no_llm_field', error: 'introspect response missing flat `llm` field', llm: null };
  }
  return { ...base, status: 'ok', llm };
}

/**
 * Fetch cost_last_24h roll-up for all probabilistic organs by POSTing a
 * single SUM(cost_usd) GROUP BY organ_urn query to Graph. Returns a map
 * keyed by lowercase organ name → cost_usd. Graceful degradation: on any
 * error returns `null` so the aggregator renders `cost_last_24h: null`
 * (UI shows "—"), matching the existing organ-level graceful-degradation
 * pattern rather than failing the whole response.
 *
 * MP-CONFIG-1 R9 — consumes `llm_usage_event` concepts written by the
 * cascade wrapper's fire-and-forget usage hook. Graph owns the concept
 * class (see concept-type-ownership.md).
 */
async function fetchCostRollup(graphUrl, fetchImpl, nowIso) {
  const since = new Date(Date.parse(nowIso) - COST_WINDOW_HOURS * 3_600_000).toISOString();

  // Concept data is a JSON string in the `concepts.data` column. SQLite's
  // json_extract pulls the typed fields. The SELECT is read-only, matching
  // Graph's /query gate (rejects non-SELECT).
  const sql = `
    SELECT
      json_extract(data, '$.organ_urn')       AS organ_urn,
      SUM(CAST(json_extract(data, '$.cost_usd') AS REAL))  AS cost_usd,
      COUNT(*) AS event_count
    FROM concepts
    WHERE json_extract(data, '$.type')      = 'llm_usage_event'
      AND json_extract(data, '$.timestamp') >= ?
    GROUP BY organ_urn
  `.trim();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetchImpl(`${graphUrl}/query`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sql, params: [since] }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const body = await res.json();
    const rows = body.rows || body || [];
    const byOrgan = {};
    for (const row of rows) {
      // organ_urn = `urn:llm-ops:organ:<organ>`
      const organUrn = row.organ_urn || row['json_extract(data, \'$.organ_urn\')'];
      if (!organUrn) continue;
      const name = organUrn.split(':').pop();
      byOrgan[name] = {
        usd: Number(row.cost_usd) || 0,
        event_count: Number(row.event_count) || 0,
      };
    }
    return byOrgan;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Factory. `deps` allows unit tests to inject a mocked fetch and clock.
 *
 * @param {object} [deps]
 * @param {Function} [deps.fetchImpl] — default: global fetch
 * @param {Function} [deps.nowImpl]   — default: () => Date.now()
 * @param {Array}    [deps.organs]    — default: PROBABILISTIC_ORGANS
 * @param {number}   [deps.cacheTtlMs]— default: CACHE_TTL_MS
 */
export function createConfigLlmAssignmentsRouter(deps = {}) {
  const fetchImpl = deps.fetchImpl || fetch;
  const nowImpl = deps.nowImpl || (() => Date.now());
  const organs = deps.organs || PROBABILISTIC_ORGANS;
  const cacheTtlMs = deps.cacheTtlMs ?? CACHE_TTL_MS;
  const graphUrl = deps.graphUrl || process.env.GRAPH_URL || DEFAULT_GRAPH_URL;

  let cached = null; // { payload, expires_at }

  async function aggregate() {
    const fetchedAtIso = new Date(nowImpl()).toISOString();

    // Probe organs + fetch cost roll-up in parallel — no sequential blocking.
    const [settled, costByOrgan] = await Promise.all([
      Promise.allSettled(organs.map((o) => fetchIntrospect(o, fetchImpl))),
      fetchCostRollup(graphUrl, fetchImpl, fetchedAtIso),
    ]);

    const records = organs.map((organ, i) => {
      const outcome = settled[i];
      const base = outcome.status === 'fulfilled'
        ? buildOrganRecord(organ, outcome.value)
        : buildOrganRecord(organ, { ok: false, error: outcome.reason?.message || 'probe rejected' });

      // MP-CONFIG-1 R9 — per-organ cost_last_24h sibling (flat, not nested
      // under `llm`, per bug #9). `null` when Graph is unreachable or when
      // no events have been recorded for the organ in the window.
      let cost = null;
      if (costByOrgan && costByOrgan[organ.name.toLowerCase()]) {
        cost = costByOrgan[organ.name.toLowerCase()];
      } else if (costByOrgan) {
        // Graph responded; no events this window → explicit zero, not null.
        cost = { usd: 0, event_count: 0 };
      }
      base.cost_last_24h = cost;
      return base;
    });

    return {
      organs: records,
      fetched_at: fetchedAtIso,
      cache_ttl_seconds: Math.round(cacheTtlMs / 1000),
      cost_window_hours: COST_WINDOW_HOURS,
    };
  }

  const router = Router();

  router.get('/llm-assignments', async (_req, res) => {
    const now = nowImpl();
    if (cached && cached.expires_at > now) {
      return res.json({ ...cached.payload, cached: true });
    }
    try {
      const payload = await aggregate();
      cached = { payload, expires_at: now + cacheTtlMs };
      res.json({ ...payload, cached: false });
    } catch (err) {
      // Should not reach here — aggregate() swallows probe errors. Defensive 500.
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
