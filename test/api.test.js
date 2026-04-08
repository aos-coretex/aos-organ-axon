/**
 * Tests for Axon API routes.
 * Mounts the API router on a standalone Express server (no Spine, no createOrgan).
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { createApiRouter } from '../server/routes/api.js';

describe('Axon API routes', () => {
  let server, baseUrl;

  // Mock Spine client (no real connection)
  const mockSpine = {
    isConnected: () => true,
    send: async (msg) => ({ message_id: 'mock-id', delivered_to: [msg.target_organ] }),
  };

  const mockConfig = {
    tier: 'aos-src',
    port: 4051,
  };

  const mockDispatch = {
    runTests: (_req, res) => res.json({ dispatched: true, target: 'Vigil' }),
    approveFix: (_req, res) => res.json({ dispatched: true, target: 'Glia' }),
    triggerBackup: (_req, res) => res.json({ dispatched: true, target: 'SafeVault' }),
    syncRepos: (_req, res) => res.json({ dispatched: true, target: 'GitSync' }),
  };

  before(async () => {
    const app = express();
    app.use(express.json());

    const apiRouter = createApiRouter({
      spine: mockSpine,
      config: mockConfig,
      dispatch: mockDispatch,
      getUiClientCount: () => 3,
    });
    app.use('/api', apiRouter);

    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it('1. GET /api/health returns ok with spine status', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'ok');
    assert.equal(body.service, 'axon');
    assert.equal(body.version, '0.1.0');
    assert.equal(body.spine_connected, true);
  });

  it('2. GET /api/config returns organ config', async () => {
    const res = await fetch(`${baseUrl}/api/config`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.tier, 'aos-src');
    assert.equal(body.port, 4051);
    assert.equal(body.organ, 'Axon');
    assert.equal(body.esb, true);
  });

  it('3. GET /api/ws/status returns connected client count', async () => {
    const res = await fetch(`${baseUrl}/api/ws/status`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.connected_clients, 3);
  });

  it('4. POST /api/dispatch/vigil/run-tests dispatches to Vigil', async () => {
    const res = await fetch(`${baseUrl}/api/dispatch/vigil/run-tests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test_ids: ['test-1'] }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.dispatched, true);
    assert.equal(body.target, 'Vigil');
  });

  it('5. POST /api/dispatch/glia/approve-fix dispatches to Glia', async () => {
    const res = await fetch(`${baseUrl}/api/dispatch/glia/approve-fix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket_urn: 'urn:test:ticket:1' }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.dispatched, true);
    assert.equal(body.target, 'Glia');
  });

  it('6. POST /api/dispatch/safevault/backup dispatches to SafeVault', async () => {
    const res = await fetch(`${baseUrl}/api/dispatch/safevault/backup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.dispatched, true);
    assert.equal(body.target, 'SafeVault');
  });

  it('7. POST /api/dispatch/gitsync/sync dispatches to GitSync', async () => {
    const res = await fetch(`${baseUrl}/api/dispatch/gitsync/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.dispatched, true);
    assert.equal(body.target, 'GitSync');
  });
});
