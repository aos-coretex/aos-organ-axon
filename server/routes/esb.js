/**
 * ESB Dashboard API routes — data-driven pages for the DIO control surface.
 *
 * ALL data flows through Spine:
 * - Spine's own endpoints: queried via direct HTTP (Spine IS the bus)
 * - Other organs: queried via directed OTM with correlation-based response
 *
 * No direct database connections. No monolith references.
 *
 * MP-16 v6t-6: 7 dashboard page APIs.
 */

import { Router } from 'express';
import { queryOrgan, querySpineDirect } from '../lib/spine-query.js';

export function createEsbRouter(spineRef, config) {
  const router = Router();

  // --- Page 1: Organ Health Dashboard ---
  // Queries each organ's /health via Spine directed OTM
  router.get('/organs/health', async (_req, res) => {
    const spine = spineRef();
    if (!spine) return res.status(503).json({ error: 'SPINE_NOT_CONNECTED' });

    // Query Spine manifest for the organ list
    const manifest = await querySpineDirect(config.spineUrl, '/manifest');
    if (!manifest.ok) return res.json({ organs: [], error: manifest.error });

    const organs = manifest.data.organs || [];
    const results = [];

    // Query each organ's health via Spine OTM (parallel, with timeout)
    const queries = organs.map(async (organ) => {
      const result = await queryOrgan(spine, organ.organ_id, 'health_query', {}, { timeoutMs: 3000 });
      return {
        name: organ.organ_id,
        required: organ.required,
        connected: organ.connected,
        status: result.ok ? (result.data?.data?.status || 'ok') : 'unreachable',
        health: result.ok ? result.data?.data : null,
        error: result.error || null,
      };
    });

    const settled = await Promise.allSettled(queries);
    for (const s of settled) {
      results.push(s.status === 'fulfilled' ? s.value : { name: 'unknown', status: 'error' });
    }

    res.json({ organs: results, count: results.length, timestamp: new Date().toISOString() });
  });

  // --- Page 2: Message Flow Visualization (initial data) ---
  // Real-time updates come via WebSocket (useSpineEvents hook)
  router.get('/flows/recent', async (_req, res) => {
    const result = await querySpineDirect(config.spineUrl, '/events?limit=50');
    if (!result.ok) return res.json({ flows: [], error: result.error });

    const events = result.data.events || [];
    const flows = events
      .filter(e => e.envelope?.payload?.event_type === 'state_transition')
      .map(e => ({
        entity_urn: e.envelope.payload.data?.entity_urn,
        from_state: e.envelope.payload.data?.previous_state,
        to_state: e.envelope.payload.data?.current_state,
        actor: e.envelope.payload.data?.actor,
        reason: e.envelope.payload.data?.reason,
        timestamp: e.envelope.timestamp,
      }));

    res.json({ flows, count: flows.length });
  });

  // --- Page 3: Spine Mailbox Monitor ---
  router.get('/spine/mailboxes', async (_req, res) => {
    const result = await querySpineDirect(config.spineUrl, '/introspect');
    if (!result.ok) return res.json({ mailboxes: [], error: result.error });

    // Query manifest for organ list to get per-organ mailbox depths
    const manifest = await querySpineDirect(config.spineUrl, '/manifest');
    const organs = manifest.ok ? (manifest.data.organs || []) : [];

    const mailboxes = [];
    for (const organ of organs) {
      const mb = await querySpineDirect(config.spineUrl, `/mailbox/${encodeURIComponent(organ.organ_id)}`);
      if (mb.ok) {
        mailboxes.push({
          organ_name: organ.organ_id,
          depth: mb.data.depth || 0,
          oldest_message_at: mb.data.oldest_message_at,
          status: mb.data.status,
        });
      }
    }

    res.json({
      mailboxes,
      total_depth: mailboxes.reduce((sum, m) => sum + m.depth, 0),
      introspect: result.data,
    });
  });

  // --- Page 4: Vigil Results ---
  router.get('/vigil/results', async (_req, res) => {
    const spine = spineRef();
    if (!spine) return res.status(503).json({ error: 'SPINE_NOT_CONNECTED' });

    const result = await queryOrgan(spine, 'Vigil', 'query_results', {}, { timeoutMs: 5000 });
    if (!result.ok) {
      return res.json({ results: [], error: result.error, detail: result.detail });
    }
    res.json({ results: result.data?.data?.results || [], source: 'Vigil' });
  });

  router.get('/vigil/health-log', async (_req, res) => {
    const spine = spineRef();
    if (!spine) return res.status(503).json({ error: 'SPINE_NOT_CONNECTED' });

    const result = await queryOrgan(spine, 'Vigil', 'query_health_log', {}, { timeoutMs: 5000 });
    if (!result.ok) {
      return res.json({ log: [], error: result.error });
    }
    res.json({ log: result.data?.data?.log || [], source: 'Vigil' });
  });

  // --- Page 5: Glia Tickets ---
  router.get('/glia/tickets', async (_req, res) => {
    const spine = spineRef();
    if (!spine) return res.status(503).json({ error: 'SPINE_NOT_CONNECTED' });

    const result = await queryOrgan(spine, 'Glia', 'query_tickets', {}, { timeoutMs: 5000 });
    if (!result.ok) {
      return res.json({ tickets: [], error: result.error });
    }
    res.json({ tickets: result.data?.data?.tickets || [], source: 'Glia' });
  });

  // --- Page 6: Governance Status ---
  router.get('/governance/status', async (_req, res) => {
    const spine = spineRef();
    if (!spine) return res.status(503).json({ error: 'SPINE_NOT_CONNECTED' });

    const result = await queryOrgan(spine, 'Graph', 'query_governance_status', {}, { timeoutMs: 5000 });
    if (!result.ok) {
      return res.json({ governance: null, error: result.error });
    }
    res.json({ governance: result.data?.data || {}, source: 'Graph' });
  });

  // --- Page 7: Job Lifecycle ---
  router.get('/spine/jobs', async (_req, res) => {
    // Query Spine state for job entities
    const result = await querySpineDirect(config.spineUrl, '/stats');
    if (!result.ok) return res.json({ jobs: [], error: result.error });

    res.json({ stats: result.data, source: 'Spine' });
  });

  router.get('/spine/jobs/active', async (_req, res) => {
    // Get recent state transitions for jobs
    const result = await querySpineDirect(config.spineUrl, '/events?type=OTM&limit=100');
    if (!result.ok) return res.json({ jobs: [], error: result.error });

    const events = result.data.events || [];
    const jobTransitions = events
      .filter(e => {
        const et = e.envelope?.payload?.event_type;
        return et === 'state_transition' && e.envelope?.payload?.data?.entity_urn?.includes(':job:');
      })
      .map(e => ({
        job_urn: e.envelope.payload.data.entity_urn,
        state: e.envelope.payload.data.current_state,
        previous: e.envelope.payload.data.previous_state,
        actor: e.envelope.payload.data.actor,
        timestamp: e.envelope.timestamp,
      }));

    // Group by job_urn to get latest state per job
    const jobMap = new Map();
    for (const t of jobTransitions) {
      const existing = jobMap.get(t.job_urn);
      if (!existing || t.timestamp > existing.timestamp) {
        jobMap.set(t.job_urn, t);
      }
    }

    const activeJobs = [...jobMap.values()].filter(j =>
      !['SUCCEEDED', 'FAILED', 'DENIED'].includes(j.state)
    );

    res.json({
      active: activeJobs,
      recent: [...jobMap.values()].slice(0, 20),
      total_tracked: jobMap.size,
    });
  });

  return router;
}
