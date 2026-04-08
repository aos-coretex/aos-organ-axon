/**
 * UI WebSocket server — pushes Spine broadcast events to connected React clients.
 *
 * Two distinct WebSocket connections in Axon:
 *   1. Axon → Spine (organ protocol, managed by organ-boot spine-client)
 *   2. React → Axon (UI protocol, managed HERE)
 *
 * This module handles #2 only. Spine broadcasts arrive via onBroadcast callback,
 * then get pushed to all connected browser clients.
 */

import { WebSocketServer } from 'ws';

const HEARTBEAT_INTERVAL = 30_000;
const clients = new Set();

let heartbeatTimer = null;

/**
 * Attach the UI WebSocket server to an existing HTTP server.
 * Handles upgrade requests on path /ws.
 *
 * @param {import('http').Server} server - HTTP server from createOrgan()
 * @returns {{ broadcast, getClientCount, close }}
 */
export function initUiWebSocket(server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req, socket, head) => {
    const { pathname } = new URL(req.url, `http://${req.headers.host}`);
    if (pathname === '/ws') {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
      });
    } else {
      // Not our upgrade — let other handlers (if any) deal with it,
      // or destroy the socket if unhandled.
      socket.destroy();
    }
  });

  wss.on('connection', (ws) => {
    ws.isAlive = true;

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('close', () => {
      clients.delete(ws);
    });

    ws.on('error', () => {
      clients.delete(ws);
    });

    clients.add(ws);

    // Send welcome message
    ws.send(JSON.stringify({ type: 'connected', data: { message: 'Axon UI WebSocket' } }));
  });

  // Heartbeat: ping every 30s, terminate stale clients
  heartbeatTimer = setInterval(() => {
    for (const ws of clients) {
      if (!ws.isAlive) {
        clients.delete(ws);
        ws.terminate();
        continue;
      }
      ws.isAlive = false;
      ws.ping();
    }
  }, HEARTBEAT_INTERVAL);

  return { broadcast, getClientCount, close: () => closeAll(wss) };
}

/**
 * Push an event to all connected UI clients.
 * Called from the Spine onBroadcast handler.
 *
 * @param {string} eventType - Spine event type (e.g. 'state_transition')
 * @param {object} data - Event payload
 */
export function broadcast(eventType, data) {
  const message = JSON.stringify({ type: eventType, data });
  for (const ws of clients) {
    if (ws.readyState === 1) { // WebSocket.OPEN
      ws.send(message);
    }
  }
}

/**
 * @returns {number} Number of currently connected UI clients
 */
export function getClientCount() {
  return clients.size;
}

function closeAll(wss) {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
  for (const ws of clients) {
    ws.terminate();
  }
  clients.clear();
  wss.close();
}
