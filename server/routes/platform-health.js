/**
 * Platform Health routes — Vigil monitoring + Cortex degraded-ratio.
 *
 * Replaces the legacy verification and cortex API surfaces (relay a7u-9).
 * ESB-clean rewire:
 *
 *   reads  — HTTP to Vigil (:4015) + python3 YAML load of the platform registry
 *   writes — Spine OTMs (test_trigger, run_tests) to Vigil
 *   cortex — HTTP proxy to Cortex (:4040)
 *
 * Forbidden in this module:
 *   - AI-Datastore database reads
 *   - legacy port range
 *   - legacy MCP backend references
 *   - paths from the old software-dev tree
 */

import { Router } from 'express';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const VIGIL_URL  = process.env.VIGIL_URL  || 'http://localhost:4015';
const CORTEX_URL = process.env.CORTEX_URL || 'http://localhost:4040';

// Platform registry (MDvault-resident — not a monolith path).
// Owned by the platform today; should move to Vigil in a future relay.
const REGISTRY_PATH =
  '/Library/AI/AI-Infra-MDvaults/MDvault-LLM-Ops/00-Registry/continuous-verification-registry.yaml';

const REGISTRY_TTL_MS = 30_000;
const FETCH_TIMEOUT_MS = 3_000;

const GROUP_META = {
  databases:    { name: 'Databases',    icon: 'db' },
  radiant:      { name: 'Radiant',      icon: 'memory' },
  minder:       { name: 'Minder',       icon: 'person' },
  capture:      { name: 'Lobe',         icon: 'event' },
  graph:        { name: 'Graph',        icon: 'graph' },
  auth:         { name: 'Phi',          icon: 'auth' },
  coretex:      { name: 'Axon',         icon: 'web' },
  symlinks:     { name: 'Symlinks',     icon: 'link' },
  launchagents: { name: 'LaunchAgents', icon: 'schedule' },
  git:          { name: 'GitSync',      icon: 'git' },
  backup:       { name: 'Backup',       icon: 'backup' },
  mcp:          { name: 'MCP Servers',  icon: 'server' },
  platform:     { name: 'Platform',     icon: 'platform' },
  encapsulation:{ name: 'Encapsulation',icon: 'platform' },
  unknown:      { name: 'Unknown',      icon: 'default' },
};

function computeFreshness(lastRunISO) {
  if (!lastRunISO) return 'dead';
  const ageMin = (Date.now() - new Date(lastRunISO).getTime()) / 60_000;
  if (ageMin < 5)    return 'live';
  if (ageMin < 60)   return 'recent';
  if (ageMin < 360)  return 'aging';
  if (ageMin < 2880) return 'stale';
  return 'dead';
}

async function fetchJson(url, { timeoutMs = FETCH_TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return { ok: false, status: res.status, error: `HTTP ${res.status}` };
    return { ok: true, status: res.status, data: await res.json() };
  } catch (err) {
    return { ok: false, status: 0, error: err.name === 'AbortError' ? 'timeout' : err.message };
  } finally {
    clearTimeout(timer);
  }
}

let registryCache = { ts: 0, data: null };

async function loadRegistry() {
  if (registryCache.data && (Date.now() - registryCache.ts) < REGISTRY_TTL_MS) {
    return registryCache.data;
  }
  try {
    const { stdout } = await execFileAsync(
      '/usr/bin/python3',
      ['-c', `import yaml,json; print(json.dumps(yaml.safe_load(open('${REGISTRY_PATH}'))))`],
      { timeout: 5000, maxBuffer: 4 * 1024 * 1024 }
    );
    const parsed = JSON.parse(stdout);
    const list = Array.isArray(parsed) ? parsed : [];
    registryCache = { ts: Date.now(), data: list };
    return list;
  } catch {
    return [];
  }
}

/**
 * Fetch Vigil's latest-result map keyed by test_id.
 */
async function vigilLatestMap() {
  const r = await fetchJson(`${VIGIL_URL}/tests/status`);
  const map = {};
  if (r.ok && Array.isArray(r.data?.tests)) {
    for (const t of r.data.tests) {
      if (t.test_id) map[t.test_id] = t;
    }
  }
  return { map, error: r.ok ? null : r.error };
}

export function createPlatformHealthRouter(spineRef) {
  const router = Router();

  // --- GET /tests — full test list with latest results ---
  router.get('/tests', async (_req, res) => {
    const [registry, latest] = await Promise.all([loadRegistry(), vigilLatestMap()]);

    // Primary join: registry × latest. Include tests present only in Vigil (no registry match)
    // so nothing is silently hidden.
    const byId = new Map();
    for (const t of registry) {
      const r = latest.map[t.id] || {};
      byId.set(t.id, {
        id: t.id,
        name: t.name,
        tier: t.tier,
        group: t.group || 'unknown',
        schedule: t.schedule,
        timeout_ms: t.timeout_ms,
        deterministic: t.deterministic || [],
        dependencies: t.dependencies || [],
        status: r.status || 'unknown',
        last_run: r.timestamp || null,
        duration_ms: r.duration_ms || 0,
        detail: r.detail || '',
        triggered_by: r.triggered_by || null,
        trigger_event: r.trigger_event || null,
        freshness: computeFreshness(r.timestamp),
      });
    }
    for (const [testId, r] of Object.entries(latest.map)) {
      if (byId.has(testId)) continue;
      byId.set(testId, {
        id: testId,
        name: testId,
        tier: 'unit',
        group: 'unknown',
        schedule: null,
        timeout_ms: null,
        deterministic: [],
        dependencies: [],
        status: r.status || 'unknown',
        last_run: r.timestamp || null,
        duration_ms: r.duration_ms || 0,
        detail: r.detail || '',
        triggered_by: r.triggered_by || null,
        trigger_event: r.trigger_event || null,
        freshness: computeFreshness(r.timestamp),
      });
    }

    res.json({
      tests: [...byId.values()],
      registry_size: registry.length,
      vigil_reachable: latest.error === null,
      vigil_error: latest.error,
    });
  });

  // --- GET /tests/:id — single test + history ---
  router.get('/tests/:id', async (req, res) => {
    const registry = await loadRegistry();
    const def = registry.find((t) => t.id === req.params.id) || null;

    const r = await fetchJson(`${VIGIL_URL}/tests/${encodeURIComponent(req.params.id)}/result`);
    const latest = r.ok ? r.data : null;

    if (!def && !latest) return res.status(404).json({ error: 'Test not found' });

    res.json({
      test: def
        ? {
            id: def.id,
            name: def.name,
            tier: def.tier,
            group: def.group,
            schedule: def.schedule,
            timeout_ms: def.timeout_ms,
            dependencies: def.dependencies || [],
            deterministic_triggers: def.deterministic || [],
          }
        : { id: req.params.id, name: req.params.id, group: 'unknown', tier: 'unit' },
      results: latest
        ? [
            {
              ...latest,
              freshness: computeFreshness(latest.timestamp),
            },
          ]
        : [],
    });
  });

  // --- GET /groups — group aggregates ---
  router.get('/groups', async (_req, res) => {
    const [registry, latest] = await Promise.all([loadRegistry(), vigilLatestMap()]);

    const groups = {};
    function ensure(id) {
      if (groups[id]) return groups[id];
      const meta = GROUP_META[id] || { name: id, icon: 'default' };
      groups[id] = { id, name: meta.name, icon: meta.icon,
                     total: 0, passing: 0, failing: 0, blocked: 0, stale: 0 };
      return groups[id];
    }

    // Registry drives the known group set + counts
    for (const t of registry) {
      const g = ensure(t.group || 'unknown');
      g.total += 1;
      const s = latest.map[t.id]?.status || 'unknown';
      if      (s === 'pass')    g.passing += 1;
      else if (s === 'fail')    g.failing += 1;
      else if (s === 'blocked') g.blocked += 1;
      else                      g.stale   += 1;
    }

    res.json({ groups: Object.values(groups) });
  });

  // --- GET /summary — overall health ---
  router.get('/summary', async (_req, res) => {
    const [registry, latest] = await Promise.all([loadRegistry(), vigilLatestMap()]);

    let passing = 0, failing = 0, blocked = 0, warn = 0, stale = 0;
    const freshDist = { live: 0, recent: 0, aging: 0, stale: 0, dead: 0 };
    let lastFullRun = null;

    const unitIds = registry.filter((t) => t.tier === 'unit').map((t) => t.id);
    const intIds  = registry.filter((t) => t.tier === 'integration').map((t) => t.id);
    let unitPass = 0, intPass = 0;

    for (const t of registry) {
      const r = latest.map[t.id] || {};
      const s = r.status || 'unknown';
      const ts = r.timestamp || null;
      const f = computeFreshness(ts);

      if (s === 'pass') {
        passing += 1;
        if (unitIds.includes(t.id)) unitPass += 1;
        if (intIds.includes(t.id))  intPass  += 1;
      } else if (s === 'fail')    failing += 1;
      else if (s === 'blocked')  blocked += 1;
      else if (s === 'running')  warn    += 1;
      else                        stale   += 1;

      freshDist[f] += 1;
      if (ts && (!lastFullRun || ts > lastFullRun)) lastFullRun = ts;
    }

    res.json({
      total: registry.length,
      passing, failing, blocked, warn, stale,
      last_full_run: lastFullRun,
      unit_health_pct:        unitIds.length > 0 ? Math.round((unitPass / unitIds.length) * 100) : 0,
      integration_health_pct:  intIds.length > 0 ? Math.round((intPass  / intIds.length)  * 100) : 0,
      freshness_distribution: freshDist,
    });
  });

  // --- Triggers: fire-and-forget OTMs to Vigil via Spine ---
  //
  // Spine's schema puts event_type/source/data INSIDE payload. The shared
  // helper sendCommand() in handlers/spine-commands.js places event_type at
  // the envelope level — Spine rejects that with SCHEMA_VALIDATION_FAILED.
  // Send the canonical shape here.

  async function dispatchOtm(eventType, data) {
    const spine = spineRef();
    if (!spine) return { error: 'SPINE_NOT_CONNECTED' };
    return spine.send({
      type: 'OTM',
      source_organ: 'Axon',
      target_organ: 'Vigil',
      payload: { event_type: eventType, source: 'Axon', data },
    });
  }

  router.post('/run/:id', async (req, res) => {
    const result = await dispatchOtm('test_trigger',
      { test_id: req.params.id, triggered_by: 'manual' });
    if (result?.error) return res.status(502).json({ error: result.error });
    res.json({ triggered: true, test_id: req.params.id, dispatch: result });
  });

  router.post('/run-group/:id', async (req, res) => {
    const result = await dispatchOtm('run_tests',
      { group: req.params.id, triggered_by: 'manual' });
    if (result?.error) return res.status(502).json({ error: result.error });
    res.json({ triggered: true, group_id: req.params.id, dispatch: result });
  });

  router.post('/run-all', async (_req, res) => {
    const result = await dispatchOtm('run_tests', { triggered_by: 'manual' });
    if (result?.error) return res.status(502).json({ error: result.error });
    res.json({ triggered: true, dispatch: result });
  });

  // --- Cortex degraded-ratio — HTTP proxy to Cortex (:4040) ---
  router.get('/cortex/degraded-ratio', async (_req, res) => {
    const r = await fetchJson(`${CORTEX_URL}/introspect`);
    if (!r.ok) {
      return res.status(502).json({
        available: false,
        error: r.error,
        cortex_reachable: false,
      });
    }
    const extra = r.data.extra || r.data;
    const ratio = extra.degraded_ratio;
    if (!ratio) {
      return res.json({
        available: false,
        reason: 'Cortex introspect has no degraded_ratio (ring buffer not active)',
      });
    }
    const classify = (x) => (x <= 0.05 ? 'green' : x <= 0.25 ? 'yellow' : 'red');
    res.json({
      available: true,
      '1h':  { ...ratio['1h'],  status: classify(ratio['1h'].ratio) },
      '24h': { ...ratio['24h'], status: classify(ratio['24h'].ratio) },
      ring_capacity: ratio.ring_capacity,
      ring_size:     ratio.ring_size,
    });
  });

  return router;
}
