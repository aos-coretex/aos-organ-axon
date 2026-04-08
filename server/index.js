/**
 * Axon organ — Coretex Admin UI control surface on Spine ESB.
 *
 * Axon is unique among organs: it's a full web application (React SPA + Express API),
 * not a simple API server. The createOrgan() factory provides Spine connectivity,
 * /health, /introspect, and the live loop. Axon adds:
 *   - Static file serving for the React SPA
 *   - A UI WebSocket (/ws) for pushing Spine broadcasts to browser clients
 *   - Dispatch routes for sending OTMs from UI actions to other organs
 *
 * Clean break: no database connections, no monolith references.
 * Data-driven pages will be built fresh against ESB organ APIs in future relays.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createOrgan } from '@coretex/organ-boot';
import config from './config.js';
import { initUiWebSocket, getClientCount } from './ws/ui-ws.js';
import { handleAxonCommand, pushToUiClients, createDispatchRoutes } from './handlers/spine-commands.js';
import { createApiRouter } from './routes/api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '..', 'dist');

// Module-level reference for the Spine client (set after boot)
let spineRef = null;

const organ = await createOrgan({
  name: 'Axon',
  port: config.port,
  binding: config.binding,
  spineUrl: config.spineUrl,

  dependencies: ['Spine', 'Radiant', 'Minder', 'Graph', 'Vigil'],

  routes: (app) => {
    // Spine client isn't available yet during routes(), so dispatch routes
    // use a lazy getter. The spine ref is assigned after createOrgan returns.
    const lazySpine = {
      send: (...args) => spineRef.send(...args),
      isConnected: () => spineRef ? spineRef.isConnected() : false,
    };

    const dispatch = createDispatchRoutes(lazySpine);
    const apiRouter = createApiRouter({
      spine: lazySpine,
      config,
      dispatch,
      getUiClientCount: getClientCount,
    });

    app.use('/api', apiRouter);

    // Static file serving for React SPA (after API routes)
    app.use(express.static(distPath));

    // SPA fallback — serve index.html for all unmatched GET routes
    // Express 5: bare '*' is invalid; use named wildcard '{*path}'
    app.get('/{*path}', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  },

  subscriptions: [
    { event_type: 'state_transition' },
    { event_type: 'verification_result' },
    { event_type: 'autoheal_ticket_update' },
    { event_type: 'spine_health' },
    { event_type: 'organ_health' },
  ],

  onMessage: handleAxonCommand,
  onBroadcast: pushToUiClients,

  healthCheck: async () => ({
    ui_clients: getClientCount(),
  }),

  introspectCheck: async () => ({
    ui_ws_clients: getClientCount(),
    transferred_pages: 15,
    data_driven_pages: 0,
    pending_esb_integrations: [
      'Vigil → Verification page',
      'Glia → Autoheal page',
      'Radiant → Radiant dashboard',
      'Minder → Minder dashboard',
      'Spine → Capture Bus page',
    ],
  }),

  onShutdown: async () => {
    // UI WebSocket cleanup is handled by its own close() method
  },
});

// Post-boot: assign spine reference and attach UI WebSocket
spineRef = organ.spine;
const uiWs = initUiWebSocket(organ.server);

process.stdout.write(JSON.stringify({
  timestamp: new Date().toISOString(),
  event: 'axon_ui_ws_ready',
  organ: 'Axon',
  port: config.port,
  ws_path: '/ws',
}) + '\n');
