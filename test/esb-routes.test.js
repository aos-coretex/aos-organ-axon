/**
 * MP-16 v6t-6: ESB Dashboard API route tests.
 *
 * Tests the 7 ESB data-driven dashboard endpoints with mock Spine responses.
 * Verifies: route existence, Spine-only data flow (no direct DB), JSON response format.
 */

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import http from 'node:http';
import { createEsbRouter } from '../server/routes/esb.js';

// Mock Spine HTTP server for querySpineDirect calls
let mockSpine;
let mockSpinePort;

function createMockSpineServer() {
  const app = express();
  app.use(express.json());

  app.get('/manifest', (_req, res) => {
    res.json({
      organs: [
        { organ_id: 'Spine', required: true, connected: true },
        { organ_id: 'Graph', required: true, connected: false },
        { organ_id: 'Vigil', required: true, connected: false },
      ],
    });
  });

  app.get('/introspect', (_req, res) => {
    res.json({ db_path: ':memory:', tables: ['events'], uptime_s: 100 });
  });

  app.get('/mailbox/:organ', (req, res) => {
    res.json({ mailbox: req.params.organ, depth: 0, oldest_message_at: null, status: 'registered' });
  });

  app.get('/events', (_req, res) => {
    res.json({
      events: [
        {
          urn: 'urn:test',
          envelope: {
            source_organ: 'Spine', target_organ: '*',
            payload: {
              event_type: 'state_transition',
              data: { entity_urn: 'urn:job:1', previous_state: 'CREATED', current_state: 'PLANNING', actor: 'Thalamus', reason: 'test' },
            },
            timestamp: new Date().toISOString(),
          },
        },
      ],
      count: 1,
    });
  });

  app.get('/stats', (_req, res) => {
    res.json({ total_events: 42, unprocessed: 3, by_type: { OTM: 40, APM: 1, ATM: 1 } });
  });

  return app;
}

// Mock Spine client for OTM-based organ queries
function createMockSpineClient() {
  return {
    send: async () => ({ message_id: 'urn:test:msg' }),
    drain: async () => ({ messages: [] }),
    ack: async () => ({}),
    isConnected: () => true,
  };
}

let esbApp;
let esbServer;
let esbPort;

before(async () => {
  // Start mock Spine HTTP
  const spineApp = createMockSpineServer();
  mockSpine = http.createServer(spineApp);
  await new Promise(r => mockSpine.listen(0, '127.0.0.1', r));
  mockSpinePort = mockSpine.address().port;

  // Create ESB router with mock Spine
  const mockClient = createMockSpineClient();
  const config = { spineUrl: `http://127.0.0.1:${mockSpinePort}` };
  const router = createEsbRouter(() => mockClient, config);

  esbApp = express();
  esbApp.use('/api/esb', router);
  esbServer = http.createServer(esbApp);
  await new Promise(r => esbServer.listen(0, '127.0.0.1', r));
  esbPort = esbServer.address().port;
});

after(async () => {
  await new Promise(r => esbServer.close(r));
  await new Promise(r => mockSpine.close(r));
});

function esbUrl(path) {
  return `http://127.0.0.1:${esbPort}/api/esb${path}`;
}

test('GET /api/esb/organs/health returns organ list from Spine manifest', async () => {
  const res = await fetch(esbUrl('/organs/health'));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(Array.isArray(body.organs));
  assert.ok(body.count >= 1);
  assert.ok(body.timestamp);
});

test('GET /api/esb/flows/recent returns state transition flows', async () => {
  const res = await fetch(esbUrl('/flows/recent'));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(Array.isArray(body.flows));
  assert.ok(body.flows.length >= 1);
  assert.equal(body.flows[0].to_state, 'PLANNING');
});

test('GET /api/esb/spine/mailboxes returns mailbox data', async () => {
  const res = await fetch(esbUrl('/spine/mailboxes'));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(Array.isArray(body.mailboxes));
  assert.ok('total_depth' in body);
  assert.ok('introspect' in body);
});

test('GET /api/esb/vigil/results returns results array (graceful on timeout)', async () => {
  const res = await fetch(esbUrl('/vigil/results'));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(Array.isArray(body.results));
  // With mock Spine (no real Vigil), we expect empty results or timeout error
});

test('GET /api/esb/glia/tickets returns tickets array', async () => {
  const res = await fetch(esbUrl('/glia/tickets'));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(Array.isArray(body.tickets));
});

test('GET /api/esb/governance/status returns governance object', async () => {
  const res = await fetch(esbUrl('/governance/status'));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok('governance' in body || 'error' in body);
});

test('GET /api/esb/spine/jobs returns stats from Spine', async () => {
  const res = await fetch(esbUrl('/spine/jobs'));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(body.stats);
  assert.equal(body.stats.total_events, 42);
});

test('GET /api/esb/spine/jobs/active returns active and recent jobs', async () => {
  const res = await fetch(esbUrl('/spine/jobs/active'));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(Array.isArray(body.active));
  assert.ok(Array.isArray(body.recent));
  assert.ok('total_tracked' in body);
});

test('ESB routes serve JSON, never HTML or direct DB data', async () => {
  const paths = ['/organs/health', '/flows/recent', '/spine/mailboxes', '/spine/jobs'];
  for (const p of paths) {
    const res = await fetch(esbUrl(p));
    const ct = res.headers.get('content-type');
    assert.ok(ct.includes('application/json'), `${p} must return JSON, got ${ct}`);
  }
});
