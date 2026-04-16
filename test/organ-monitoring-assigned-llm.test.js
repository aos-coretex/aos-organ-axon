/**
 * Tests for the `formatAssignedLlm` per-card formatter used by
 * OrganMonitoringPage (MP-CONFIG-1 R8, l9m-8).
 *
 * Covers the three display states the relay pins:
 *   1. probabilistic organ with OK data → "<provider>:<model> (N agents)"
 *   2. deterministic organ (no llmRecord) → "N/A (deterministic)"
 *   3. unreachable / no_llm_field → "—"
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatAssignedLlm, formatCostLast24h } from '../src/pages/control/assignedLlm.js';

describe('OrganMonitoringPage — formatAssignedLlm', () => {
  it('probabilistic organ renders "<provider>:<model> (N agents)"', () => {
    const rec = {
      status: 'ok',
      llm: {
        default: { defaultProvider: 'anthropic', defaultModel: 'claude-haiku-4-5-20251001' },
        agents: [{ name: 'clause-matcher', config: {} }],
      },
    };
    assert.equal(formatAssignedLlm(rec), 'anthropic:claude-haiku-4-5-20251001 (1 agents)');
  });

  it('probabilistic organ with 5 agents renders the correct count', () => {
    const rec = {
      status: 'ok',
      llm: {
        default: { defaultProvider: 'anthropic', defaultModel: 'claude-haiku-4-5-20251001' },
        agents: new Array(5).fill(null).map((_, i) => ({ name: `a-${i}`, config: {} })),
      },
    };
    assert.equal(formatAssignedLlm(rec), 'anthropic:claude-haiku-4-5-20251001 (5 agents)');
  });

  it('deterministic organ (no llmRecord from aggregator) renders "N/A (deterministic)"', () => {
    assert.equal(formatAssignedLlm(null), 'N/A (deterministic)');
    assert.equal(formatAssignedLlm(undefined), 'N/A (deterministic)');
  });

  it('unreachable organ renders em-dash', () => {
    const rec = { status: 'unreachable', error: 'timeout', llm: null };
    assert.equal(formatAssignedLlm(rec), '—');
  });

  it('no_llm_field organ renders em-dash', () => {
    const rec = { status: 'no_llm_field', error: 'introspect response missing flat `llm` field', llm: null };
    assert.equal(formatAssignedLlm(rec), '—');
  });

  it('malformed llm record renders em-dash (defensive)', () => {
    assert.equal(formatAssignedLlm({ status: 'ok', llm: null }), '—');
    assert.equal(formatAssignedLlm({ status: 'ok', llm: { default: null } }), '—');
  });
});

describe('OrganMonitoringPage — formatCostLast24h (R9)', () => {
  it('null llmRecord (deterministic) renders em-dash', () => {
    assert.equal(formatCostLast24h(null), '—');
  });

  it('cost_last_24h:null (Graph unreachable) renders em-dash', () => {
    assert.equal(formatCostLast24h({ status: 'ok', llm: {}, cost_last_24h: null }), '—');
  });

  it('zero cost renders $0.00', () => {
    assert.equal(formatCostLast24h({ cost_last_24h: { usd: 0, event_count: 0 } }), '$0.00');
  });

  it('non-zero cost renders with 2-decimal USD formatting', () => {
    assert.equal(formatCostLast24h({ cost_last_24h: { usd: 1.2345, event_count: 7 } }), '$1.23');
    assert.equal(formatCostLast24h({ cost_last_24h: { usd: 0.001, event_count: 1 } }), '$0.00');
    assert.equal(formatCostLast24h({ cost_last_24h: { usd: 42, event_count: 100 } }), '$42.00');
  });

  it('missing cost_last_24h on a probabilistic record renders em-dash', () => {
    assert.equal(formatCostLast24h({ status: 'ok', llm: {} }), '—');
  });
});
