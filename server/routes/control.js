/**
 * Control Surface routes — operator interface for the DIO.
 *
 * Endpoints:
 *   GET /api/control/organs          — aggregate status for all 28 organs
 *   GET /api/control/organs/:name    — deep health + introspect for one organ
 *
 * Light semantics (computed client-side from this data):
 *   red    — health unreachable
 *   orange — health ok but Spine does not list the organ in /consumers
 *   green  — health ok AND Spine lists the organ
 *   yellow — spine-connected AND recent activity within activity_window_s
 *            (gated per-organ by sequence verification in relay a7u-10; default OFF)
 */

import { Router } from 'express';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { ORGANS, ORGAN_BY_NAME } from '../data/organs.js';

const FETCH_TIMEOUT_MS = 2000;
const ACTIVITY_WINDOW_MS = 60_000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const YELLOW_GATE_PATH = path.resolve(__dirname, '..', 'data', 'yellow-gate.json');

/**
 * Read the yellow-light gate file. Per relay a7u-10: an organ may only show
 * yellow after the platform architect has confirmed its sequence diagram.
 * The gate file persists those confirmations. Re-read on each request so
 * edits take effect without a restart.
 */
async function readYellowGate() {
  try {
    const raw = await readFile(YELLOW_GATE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed.confirmed || {};
  } catch {
    return {};
  }
}

async function fetchJson(url, { timeoutMs = FETCH_TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return { ok: false, status: res.status, error: `HTTP ${res.status}` };
    const data = await res.json();
    return { ok: true, status: res.status, data };
  } catch (err) {
    return { ok: false, status: 0, error: err.name === 'AbortError' ? 'timeout' : err.message };
  } finally {
    clearTimeout(timer);
  }
}

export function createControlRouter(config) {
  const router = Router();
  const spineUrl = config.spineUrl;

  /**
   * Aggregate status across all 28 organs.
   * Always returns 200 with partial data — downstream failures are reported per-organ.
   */
  router.get('/organs', async (_req, res) => {
    const since = new Date(Date.now() - ACTIVITY_WINDOW_MS).toISOString();

    const [consumersRes, recentEventsRes, gate] = await Promise.all([
      fetchJson(`${spineUrl}/consumers`),
      fetchJson(`${spineUrl}/events?since=${encodeURIComponent(since)}&limit=500`),
      readYellowGate(),
    ]);

    const connectedSet = new Set(
      (consumersRes.ok ? (consumersRes.data.consumers || []) : [])
        .filter(c => c.status === 'connected')
        .map(c => c.organ_name)
    );

    // Build per-organ recent activity counts (source OR target)
    const activityCount = new Map();
    if (recentEventsRes.ok) {
      const events = recentEventsRes.data.events || [];
      for (const e of events) {
        const src = e.envelope?.source_organ || e.source_organ;
        const tgt = e.envelope?.target_organ || e.target_organ;
        if (src && src !== '*') activityCount.set(src, (activityCount.get(src) || 0) + 1);
        if (tgt && tgt !== '*' && tgt !== src) {
          activityCount.set(tgt, (activityCount.get(tgt) || 0) + 1);
        }
      }
    }

    const healthResults = await Promise.all(
      ORGANS.map(async (organ) => {
        const hr = await fetchJson(`http://localhost:${organ.port}/health`);
        // Spine is the bus; it never appears in its own /consumers list.
        // Treat Spine as "spine-connected" whenever its health is ok.
        const spineListed = organ.name === 'Spine'
          ? hr.ok
          : connectedSet.has(organ.name);
        const recentCount = activityCount.get(organ.name) || 0;
        const confirmed = gate[organ.name] === true;
        const spineConnected = hr.ok && spineListed;
        return {
          num: organ.num,
          name: organ.name,
          port: organ.port,
          description: organ.description,
          health_ok: hr.ok,
          health_error: hr.ok ? null : hr.error,
          health_status: hr.ok ? (hr.data?.status || 'ok') : null,
          spine_connected: spineConnected,
          recent_event_count: recentCount,
          sequence_confirmed: confirmed,
          // Yellow requires: sequence confirmation AND spine-connected AND recent traffic.
          // Gate file: server/data/yellow-gate.json. See docs/sequence-diagrams/activation-protocol.md.
          actively_exchanging: confirmed && spineConnected && recentCount > 0,
          health: hr.ok ? hr.data : null,
        };
      })
    );

    res.json({
      organs: healthResults,
      count: healthResults.length,
      spine: {
        reachable: consumersRes.ok,
        connected_organs: connectedSet.size,
        recent_events: recentEventsRes.ok ? (recentEventsRes.data.events?.length || 0) : 0,
      },
      activity_window_s: ACTIVITY_WINDOW_MS / 1000,
      generated_at: new Date().toISOString(),
    });
  });

  /**
   * Deep status for a single organ — health + introspect.
   */
  router.get('/organs/:name', async (req, res) => {
    const organ = ORGAN_BY_NAME[req.params.name];
    if (!organ) return res.status(404).json({ error: 'UNKNOWN_ORGAN', name: req.params.name });

    const [health, introspect] = await Promise.all([
      fetchJson(`http://localhost:${organ.port}/health`),
      fetchJson(`http://localhost:${organ.port}/introspect`),
    ]);

    res.json({
      name: organ.name,
      num: organ.num,
      port: organ.port,
      description: organ.description,
      health: health.ok ? health.data : { error: health.error },
      introspect: introspect.ok ? introspect.data : { error: introspect.error },
      generated_at: new Date().toISOString(),
    });
  });

  return router;
}
