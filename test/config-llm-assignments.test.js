/**
 * Tests for /api/config/llm-assignments aggregator — MP-CONFIG-1 R8 (l9m-8).
 *
 * No real Spine, no real organ processes. Uses dependency injection to mock
 * fetch + clock, plus a stub 3-organ registry so we can pin specific
 * reachability / shape scenarios.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { createConfigLlmAssignmentsRouter } from '../server/routes/config-llm-assignments.js';

function makeFetchMock(responseByUrl) {
  return async function mockFetch(url /* , opts */) {
    const entry = responseByUrl[url];
    if (!entry) {
      return { ok: false, status: 404, json: async () => ({}) };
    }
    if (entry.throw) {
      throw new Error(entry.throw);
    }
    return {
      ok: entry.ok ?? true,
      status: entry.status ?? 200,
      json: async () => entry.body,
    };
  };
}

const FIXTURE_ORGANS = [
  { num: 60,  name: 'Radiant',   port: 14006 },
  { num: 190, name: 'Arbiter',   port: 14021 },
  { num: 110, name: 'Syntra',    port: 14011 }, // stand-in for "unreachable organ"
];

const INTROSPECT_RADIANT = {
  // Envelope-wrapped (organ-boot shared-lib wraps introspectCheck in `extra`).
  extra: {
    dream_state: { cycleNumber: 0 },
    llm: {
      organ_number: 60,
      organ_name: 'radiant',
      default: {
        agentName: 'default',
        defaultProvider: 'anthropic',
        defaultModel: 'claude-sonnet-4-6',
        maxTokens: 2048,
      },
      agents: [
        { name: 'radiant-dreamer', config: { agentName: 'radiant-dreamer', defaultProvider: 'anthropic', defaultModel: 'claude-sonnet-4-6', maxTokens: 2048 } },
      ],
    },
  },
};

const INTROSPECT_ARBITER = {
  // Flat shape (no envelope) — aggregator must accept both.
  llm: {
    organ_number: 190,
    organ_name: 'arbiter',
    default: {
      agentName: 'default',
      defaultProvider: 'anthropic',
      defaultModel: 'claude-haiku-4-5-20251001',
      maxTokens: 2048,
    },
    agents: [
      { name: 'clause-matcher', config: { agentName: 'clause-matcher', defaultProvider: 'anthropic', defaultModel: 'claude-haiku-4-5-20251001', maxTokens: 2048 } },
    ],
  },
};

describe('Axon /api/config/llm-assignments aggregator', () => {
  let server, baseUrl;
  let nowMs = 1_700_000_000_000;
  const nowImpl = () => nowMs;
  let fetchCallCount = 0;

  const fetchImpl = async (url, opts) => {
    fetchCallCount += 1;
    // R9 cost-rollup POST — respond with zero rows so the aggregator wires
    // cost_last_24h: {usd:0, event_count:0} onto every organ record.
    if (url.endsWith('/query') && opts?.method === 'POST') {
      return { ok: true, status: 200, json: async () => ({ rows: [] }) };
    }
    const delegate = makeFetchMock({
      'http://localhost:14006/introspect': { ok: true, body: INTROSPECT_RADIANT },
      'http://localhost:14021/introspect': { ok: true, body: INTROSPECT_ARBITER },
      'http://localhost:14011/introspect': { throw: 'ECONNREFUSED' },
    });
    return delegate(url, opts);
  };

  before(async () => {
    const app = express();
    const router = createConfigLlmAssignmentsRouter({
      fetchImpl,
      nowImpl,
      organs: FIXTURE_ORGANS,
      cacheTtlMs: 30_000,
    });
    app.use('/api/config', router);
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

  it('returns flat aggregated response with ok + unreachable organ records', async () => {
    fetchCallCount = 0;
    const res = await fetch(`${baseUrl}/api/config/llm-assignments`);
    assert.equal(res.status, 200);
    const body = await res.json();

    // Top-level shape.
    assert.ok(Array.isArray(body.organs), 'organs array present');
    assert.equal(body.organs.length, 3);
    assert.ok(typeof body.fetched_at === 'string' && body.fetched_at.includes('T'));
    assert.equal(body.cache_ttl_seconds, 30);
    assert.equal(body.cached, false);

    // Envelope-wrapped introspect (Radiant) — llm extracted from `extra.llm`.
    const radiant = body.organs.find((o) => o.organ_name === 'radiant');
    assert.equal(radiant.status, 'ok');
    assert.equal(radiant.llm.default.defaultModel, 'claude-sonnet-4-6');
    assert.equal(radiant.llm.agents.length, 1);

    // Flat introspect (Arbiter).
    const arbiter = body.organs.find((o) => o.organ_name === 'arbiter');
    assert.equal(arbiter.status, 'ok');
    assert.equal(arbiter.llm.default.defaultModel, 'claude-haiku-4-5-20251001');

    // Unreachable organ — marked, not 500.
    const syntra = body.organs.find((o) => o.organ_name === 'syntra');
    assert.equal(syntra.status, 'unreachable');
    assert.equal(syntra.llm, null);
    assert.ok(typeof syntra.error === 'string' && syntra.error.length > 0);
  });

  it('serves cached response within TTL without re-probing organs', async () => {
    // Fresh router instance so the shared-cache state from the first test
    // doesn't prejudge cache-miss semantics.
    let localFetchCount = 0;
    const localFetch = async (url, opts) => {
      localFetchCount += 1;
      return fetchImpl(url, opts);
    };
    const app = express();
    app.use('/api/config', createConfigLlmAssignmentsRouter({
      fetchImpl: localFetch,
      nowImpl,
      organs: FIXTURE_ORGANS,
      cacheTtlMs: 30_000,
    }));
    const s = await new Promise((resolve) => { const srv = app.listen(0, '127.0.0.1', () => resolve(srv)); });
    try {
      const addr = s.address();
      const url = `http://127.0.0.1:${addr.port}/api/config/llm-assignments`;

      // First call — cache miss, probes all 3 organs + 1 Graph /query (R9 cost rollup).
      let res = await fetch(url);
      let body = await res.json();
      assert.equal(body.cached, false);
      assert.equal(localFetchCount, 4);

      // Second call within TTL — cache hit; no new fetches.
      res = await fetch(url);
      body = await res.json();
      assert.equal(body.cached, true);
      assert.equal(localFetchCount, 4, 'no additional fetches within TTL window');
    } finally {
      await new Promise((r) => s.close(r));
    }
  });

  it('re-probes after TTL expiry', async () => {
    let localNow = 1_700_000_000_000;
    let localFetchCount = 0;
    const localFetch = async (url, opts) => { localFetchCount += 1; return fetchImpl(url, opts); };
    const app = express();
    app.use('/api/config', createConfigLlmAssignmentsRouter({
      fetchImpl: localFetch,
      nowImpl: () => localNow,
      organs: FIXTURE_ORGANS,
      cacheTtlMs: 30_000,
    }));
    const s = await new Promise((resolve) => { const srv = app.listen(0, '127.0.0.1', () => resolve(srv)); });
    try {
      const addr = s.address();
      const url = `http://127.0.0.1:${addr.port}/api/config/llm-assignments`;

      // Prime cache — 3 introspects + 1 Graph /query.
      await (await fetch(url)).json();
      assert.equal(localFetchCount, 4);

      // Advance clock past TTL; next call must re-probe.
      localNow += 60_000;
      const body = await (await fetch(url)).json();
      assert.equal(body.cached, false);
      assert.equal(localFetchCount, 8, 're-probed all 3 organs + Graph /query after TTL expiry');
    } finally {
      await new Promise((r) => s.close(r));
    }
  });

  it('response latency is bounded by slowest probe, not by their sum (parallel fanout)', async () => {
    // Build a router with a slow fetch and measure wall time. Three organs,
    // each simulated with a ~60ms delay. Sequential would be ~180ms+;
    // parallel must be < ~120ms with healthy margin.
    const slowFetch = async (url) => {
      await new Promise((r) => setTimeout(r, 60));
      if (url.includes('14006')) return { ok: true, status: 200, json: async () => INTROSPECT_RADIANT };
      if (url.includes('14021')) return { ok: true, status: 200, json: async () => INTROSPECT_ARBITER };
      throw new Error('ECONNREFUSED');
    };
    const app = express();
    app.use('/api/config', createConfigLlmAssignmentsRouter({
      fetchImpl: slowFetch,
      organs: FIXTURE_ORGANS,
      cacheTtlMs: 0, // no cache — force fresh probe
      nowImpl: () => Date.now(),
    }));
    const s = await new Promise((resolve) => {
      const srv = app.listen(0, '127.0.0.1', () => resolve(srv));
    });
    try {
      const addr = s.address();
      const start = Date.now();
      const res = await fetch(`http://127.0.0.1:${addr.port}/api/config/llm-assignments`);
      await res.json();
      const elapsed = Date.now() - start;
      assert.ok(elapsed < 150, `parallel fanout should complete < 150ms, got ${elapsed}ms`);
    } finally {
      await new Promise((r) => s.close(r));
    }
  });

  it('marks organ as `no_llm_field` when /introspect response lacks llm field', async () => {
    const noLlmFetch = async (url) => {
      if (url.includes('14006')) {
        return { ok: true, status: 200, json: async () => ({ extra: { dream_state: {} /* no llm field */ } }) };
      }
      return { ok: false, status: 404, json: async () => ({}) };
    };
    const app = express();
    app.use('/api/config', createConfigLlmAssignmentsRouter({
      fetchImpl: noLlmFetch,
      organs: [FIXTURE_ORGANS[0]],
      cacheTtlMs: 0,
    }));
    const s = await new Promise((resolve) => { const srv = app.listen(0, '127.0.0.1', () => resolve(srv)); });
    try {
      const addr = s.address();
      const res = await fetch(`http://127.0.0.1:${addr.port}/api/config/llm-assignments`);
      const body = await res.json();
      assert.equal(body.organs[0].status, 'no_llm_field');
      assert.equal(body.organs[0].llm, null);
    } finally {
      await new Promise((r) => s.close(r));
    }
  });
});
