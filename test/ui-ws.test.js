/**
 * Tests for the UI WebSocket server.
 * Creates a standalone HTTP server, attaches the UI WS, and tests from a WS client.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { WebSocket } from 'ws';
import { initUiWebSocket, broadcast, getClientCount } from '../server/ws/ui-ws.js';

describe('Axon UI WebSocket', () => {
  let httpServer, port, uiWs;

  before(async () => {
    httpServer = http.createServer();

    await new Promise((resolve) => {
      httpServer.listen(0, '127.0.0.1', () => {
        port = httpServer.address().port;
        resolve();
      });
    });

    uiWs = initUiWebSocket(httpServer);
  });

  after(async () => {
    uiWs.close();
    await new Promise((resolve) => httpServer.close(resolve));
  });

  /**
   * Connect a WS client and return it along with the first message (welcome).
   * The message listener is attached before the connection opens to avoid race conditions.
   */
  function connectClient() {
    return new Promise((resolve, reject) => {
      const messages = [];
      const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`);

      ws.on('message', (data) => {
        messages.push(JSON.parse(data.toString()));
      });

      ws.on('open', () => {
        // Allow a tick for the welcome message to arrive
        setTimeout(() => resolve({ ws, messages }), 50);
      });

      ws.on('error', reject);
    });
  }

  function waitForMessage(ws) {
    return new Promise((resolve) => {
      ws.once('message', (data) => resolve(JSON.parse(data.toString())));
    });
  }

  it('1. client connects and receives welcome message', async () => {
    const { ws, messages } = await connectClient();
    assert.equal(messages.length, 1);
    assert.equal(messages[0].type, 'connected');
    assert.equal(messages[0].data.message, 'Axon UI WebSocket');
    ws.close();
    await new Promise((r) => setTimeout(r, 50));
  });

  it('2. getClientCount tracks connected clients', async () => {
    const countBefore = getClientCount();
    const { ws: ws1 } = await connectClient();
    const { ws: ws2 } = await connectClient();
    assert.equal(getClientCount(), countBefore + 2);
    ws1.close();
    ws2.close();
    await new Promise((r) => setTimeout(r, 100));
  });

  it('3. broadcast pushes event to connected clients', async () => {
    const { ws } = await connectClient();

    const msgPromise = waitForMessage(ws);
    broadcast('verification_result', { test_id: 'test-1', status: 'pass' });
    const msg = await msgPromise;

    assert.equal(msg.type, 'verification_result');
    assert.equal(msg.data.test_id, 'test-1');
    assert.equal(msg.data.status, 'pass');
    ws.close();
    await new Promise((r) => setTimeout(r, 50));
  });

  it('4. broadcast reaches multiple clients', async () => {
    const { ws: ws1 } = await connectClient();
    const { ws: ws2 } = await connectClient();

    const p1 = waitForMessage(ws1);
    const p2 = waitForMessage(ws2);
    broadcast('organ_health', { organ: 'Vigil', status: 'ok' });

    const [msg1, msg2] = await Promise.all([p1, p2]);
    assert.equal(msg1.type, 'organ_health');
    assert.equal(msg2.type, 'organ_health');

    ws1.close();
    ws2.close();
    await new Promise((r) => setTimeout(r, 50));
  });

  it('5. non-/ws upgrade requests are rejected', async () => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}/other-path`);
    const closed = await new Promise((resolve) => {
      ws.on('error', () => resolve(true));
      ws.on('close', () => resolve(true));
    });
    assert.ok(closed);
  });

  it('6. client count decreases on disconnect', async () => {
    const { ws } = await connectClient();
    const countWith = getClientCount();
    ws.close();
    await new Promise((r) => setTimeout(r, 100));
    assert.ok(getClientCount() < countWith);
  });
});
