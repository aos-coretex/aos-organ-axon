/**
 * Axon API routes — minimal surface for the clean ESB shell.
 *
 * No database connections. No monolith references.
 * Data-driven routes will be added in future relays when ESB organs serve the data.
 */

import { Router } from 'express';

/**
 * Create the API router. Receives spine client for dispatch routes.
 *
 * @param {object} opts
 * @param {object} opts.spine - SpineClient instance (for dispatch)
 * @param {object} opts.config - Server config
 * @param {object} opts.dispatch - Dispatch route handlers from spine-commands
 * @param {function} opts.getUiClientCount - UI WebSocket client count function
 * @returns {Router}
 */
export function createApiRouter({ spine, config, dispatch, getUiClientCount }) {
  const router = Router();

  // --- Infrastructure ---

  router.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'axon',
      version: '0.1.0',
      spine_connected: spine.isConnected(),
    });
  });

  router.get('/config', (_req, res) => {
    res.json({
      tier: config.tier,
      port: config.port,
      organ: 'Axon',
      esb: true,
    });
  });

  router.get('/ws/status', (_req, res) => {
    res.json({
      connected_clients: getUiClientCount(),
    });
  });

  // --- Dispatch routes (send OTMs to other organs via Spine) ---

  router.post('/dispatch/vigil/run-tests', dispatch.runTests);
  router.post('/dispatch/glia/approve-fix', dispatch.approveFix);
  router.post('/dispatch/safevault/backup', dispatch.triggerBackup);
  router.post('/dispatch/gitsync/sync', dispatch.syncRepos);

  return router;
}
