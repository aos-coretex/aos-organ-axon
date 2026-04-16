/**
 * Tests for cost_last_24h roll-up in /api/config/llm-assignments
 * — MP-CONFIG-1 R9.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { createConfigLlmAssignmentsRouter } from '../server/routes/config-llm-assignments.js';

const FIXTURE_ORGANS = [
  { num: 60, name: 'Radiant', port: 14006 },
  { num: 190, name: 'Arbiter', port: 14021 },
];

const INTROSPECT_RADIANT = { llm: { default: { defaultProvider: 'anthropic', defaultModel: 'claude-sonnet-4-6', maxTokens: 2048 }, agents: [] } };
const INTROSPECT_ARBITER = { llm: { default: { defaultProvider: 'anthropic', defaultModel: 'claude-haiku-4-5-20251001', maxTokens: 2048 }, agents: [] } };

describe('Axon /api/config/llm-assignments — cost_last_24h (R9)', () => {
  it('populates cost_last_24h from Graph /query rollup', async () => {
    const graphQueryCalls = [];
    const fetchImpl = async (url, opts) => {
      if (url.endsWith('/introspect') && url.includes('14006')) {
        return { ok: true, status: 200, json: async () => INTROSPECT_RADIANT };
      }
      if (url.endsWith('/introspect') && url.includes('14021')) {
        return { ok: true, status: 200, json: async () => INTROSPECT_ARBITER };
      }
      if (url.endsWith('/query') && opts?.method === 'POST') {
        graphQueryCalls.push({ url, body: JSON.parse(opts.body) });
        return {
          ok: true,
          status: 200,
          json: async () => ({
            rows: [
              { organ_urn: 'urn:llm-ops:organ:radiant', cost_usd: 0.1234, event_count: 12 },
              { organ_urn: 'urn:llm-ops:organ:arbiter', cost_usd: 0.0567, event_count: 4 },
            ],
          }),
        };
      }
      return { ok: false, status: 404, json: async () => ({}) };
    };

    const app = express();
    app.use('/api/config', createConfigLlmAssignmentsRouter({
      fetchImpl,
      organs: FIXTURE_ORGANS,
      cacheTtlMs: 0,
      graphUrl: 'http://localhost:4020',
    }));
    const s = await new Promise((resolve) => { const srv = app.listen(0, '127.0.0.1', () => resolve(srv)); });
    try {
      const addr = s.address();
      const res = await fetch(`http://127.0.0.1:${addr.port}/api/config/llm-assignments`);
      const body = await res.json();
      assert.equal(body.cost_window_hours, 24);

      const radiant = body.organs.find((o) => o.organ_name === 'radiant');
      const arbiter = body.organs.find((o) => o.organ_name === 'arbiter');
      assert.equal(radiant.cost_last_24h.usd, 0.1234);
      assert.equal(radiant.cost_last_24h.event_count, 12);
      assert.equal(arbiter.cost_last_24h.usd, 0.0567);
      assert.equal(arbiter.cost_last_24h.event_count, 4);

      // The Graph /query request must be a SELECT-only SQL with a parameterized `since` value.
      assert.equal(graphQueryCalls.length, 1);
      assert.match(graphQueryCalls[0].body.sql, /FROM concepts/);
      assert.match(graphQueryCalls[0].body.sql, /GROUP BY organ_urn/);
      assert.equal(graphQueryCalls[0].body.params.length, 1);
    } finally {
      await new Promise((r) => s.close(r));
    }
  });

  it('falls back to cost_last_24h: null when Graph /query is unreachable', async () => {
    const fetchImpl = async (url, opts) => {
      if (url.endsWith('/introspect') && url.includes('14006')) {
        return { ok: true, status: 200, json: async () => INTROSPECT_RADIANT };
      }
      if (url.endsWith('/introspect') && url.includes('14021')) {
        return { ok: true, status: 200, json: async () => INTROSPECT_ARBITER };
      }
      if (url.endsWith('/query')) {
        throw new Error('ECONNREFUSED');
      }
      return { ok: false, status: 404, json: async () => ({}) };
    };
    const app = express();
    app.use('/api/config', createConfigLlmAssignmentsRouter({
      fetchImpl,
      organs: FIXTURE_ORGANS,
      cacheTtlMs: 0,
    }));
    const s = await new Promise((resolve) => { const srv = app.listen(0, '127.0.0.1', () => resolve(srv)); });
    try {
      const addr = s.address();
      const res = await fetch(`http://127.0.0.1:${addr.port}/api/config/llm-assignments`);
      const body = await res.json();
      const radiant = body.organs.find((o) => o.organ_name === 'radiant');
      // Graph unreachable → null (UI renders em-dash)
      assert.equal(radiant.cost_last_24h, null);
    } finally {
      await new Promise((r) => s.close(r));
    }
  });

  it('empty Graph result (no events) yields cost_last_24h: {usd:0, event_count:0}', async () => {
    const fetchImpl = async (url, opts) => {
      if (url.endsWith('/introspect') && url.includes('14006')) {
        return { ok: true, status: 200, json: async () => INTROSPECT_RADIANT };
      }
      if (url.endsWith('/introspect') && url.includes('14021')) {
        return { ok: true, status: 200, json: async () => INTROSPECT_ARBITER };
      }
      if (url.endsWith('/query')) {
        return { ok: true, status: 200, json: async () => ({ rows: [] }) };
      }
      return { ok: false, status: 404, json: async () => ({}) };
    };
    const app = express();
    app.use('/api/config', createConfigLlmAssignmentsRouter({
      fetchImpl,
      organs: FIXTURE_ORGANS,
      cacheTtlMs: 0,
    }));
    const s = await new Promise((resolve) => { const srv = app.listen(0, '127.0.0.1', () => resolve(srv)); });
    try {
      const addr = s.address();
      const res = await fetch(`http://127.0.0.1:${addr.port}/api/config/llm-assignments`);
      const body = await res.json();
      const radiant = body.organs.find((o) => o.organ_name === 'radiant');
      assert.deepEqual(radiant.cost_last_24h, { usd: 0, event_count: 0 });
    } finally {
      await new Promise((r) => s.close(r));
    }
  });
});
