/**
 * Spine query utility — correlation-based request-response over Spine OTMs.
 *
 * Pattern: Send directed OTM with correlation_id and reply_to='Axon',
 * then poll Axon's mailbox for the response matching that correlation_id.
 *
 * All data flows through Spine — no direct organ HTTP calls.
 */

import { generateUrn } from '@coretex/organ-boot/urn';

const DEFAULT_TIMEOUT_MS = 5000;
const POLL_INTERVAL_MS = 100;

/**
 * Send a query OTM to a target organ via Spine and await the response.
 *
 * @param {object} spine - Spine client (from organ-boot)
 * @param {string} targetOrgan - Target organ name
 * @param {string} eventType - OTM event_type for the query
 * @param {object} data - Query payload data
 * @param {object} opts - { timeoutMs }
 * @returns {object} Response payload from the target organ, or { error, timeout }
 */
export async function queryOrgan(spine, targetOrgan, eventType, data = {}, opts = {}) {
  const { timeoutMs = DEFAULT_TIMEOUT_MS } = opts;
  const correlationId = generateUrn('query');

  const envelope = {
    type: 'OTM',
    source_organ: 'Axon',
    target_organ: targetOrgan,
    correlation_id: correlationId,
    reply_to: 'Axon',
    payload: { event_type: eventType, source: 'Axon', data },
  };

  const sendResult = await spine.send(envelope);
  if (!sendResult || sendResult.error) {
    return { error: 'SEND_FAILED', detail: sendResult?.error || 'spine unreachable' };
  }

  // Poll Axon's mailbox for the correlated response
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const drained = await spine.drain(5);
    if (drained?.messages?.length > 0) {
      const match = drained.messages.find(m => m.correlation_id === correlationId);
      if (match) {
        // Ack the matched message
        await spine.ack([match.message_id]);
        return { ok: true, data: match.payload, source_organ: match.source_organ };
      }
      // Ack non-matching messages too (they belong to other flows)
      const otherIds = drained.messages.filter(m => m.correlation_id !== correlationId).map(m => m.message_id);
      if (otherIds.length > 0) await spine.ack(otherIds);
    }
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
  }

  return { error: 'TIMEOUT', detail: `No response from ${targetOrgan} within ${timeoutMs}ms` };
}

/**
 * Query Spine's own HTTP endpoints directly (not via OTM — Spine IS the bus).
 *
 * @param {string} spineUrl - Spine base URL
 * @param {string} path - HTTP path (e.g., '/health', '/introspect', '/state/machines')
 * @returns {object} JSON response
 */
export async function querySpineDirect(spineUrl, path) {
  try {
    const res = await fetch(`${spineUrl}${path}`);
    if (!res.ok) return { error: `HTTP_${res.status}`, detail: await res.text() };
    return { ok: true, data: await res.json() };
  } catch (err) {
    return { error: 'SPINE_UNREACHABLE', detail: err.message };
  }
}
