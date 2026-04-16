/**
 * `Assigned LLM` per-card formatter — MP-CONFIG-1 R8 (l9m-8).
 *
 * Contract (per relay §76-82):
 *   - probabilistic organ with `llm.default` present:
 *       "<provider>:<model> (N agents)"  e.g. "anthropic:claude-haiku-4-5-20251001 (1 agents)"
 *   - deterministic organ (no llmRecord passed in — aggregator doesn't include it):
 *       "N/A (deterministic)"
 *   - unreachable / no_llm_field:
 *       "—"
 *
 * Extracted to its own module so it's importable by both the .jsx page and
 * the plain node --test suite (which cannot load .jsx without a transformer).
 */

export function formatAssignedLlm(llmRecord) {
  if (!llmRecord) return 'N/A (deterministic)';
  if (llmRecord.status === 'unreachable' || llmRecord.status === 'no_llm_field') return '—';
  if (llmRecord.status !== 'ok' || !llmRecord.llm || !llmRecord.llm.default) return '—';
  const d = llmRecord.llm.default;
  const provider = d.defaultProvider || '?';
  const model = d.defaultModel || '?';
  const agentCount = Array.isArray(llmRecord.llm.agents) ? llmRecord.llm.agents.length : 0;
  return `${provider}:${model} (${agentCount} agents)`;
}

/**
 * Format the `cost_last_24h` sibling field (MP-CONFIG-1 R9) for display on an
 * OrganMonitoringPage card.
 *
 * Contract:
 *   - llmRecord === null (deterministic organ)                    → "—"
 *   - llmRecord.cost_last_24h === null (Graph unreachable)        → "—"
 *   - llmRecord.cost_last_24h.usd === 0                           → "$0.00"
 *   - llmRecord.cost_last_24h.usd > 0                             → "$X.XX"
 */
export function formatCostLast24h(llmRecord) {
  if (!llmRecord) return '—';
  const cost = llmRecord.cost_last_24h;
  if (!cost || typeof cost.usd !== 'number') return '—';
  return `$${cost.usd.toFixed(2)}`;
}
