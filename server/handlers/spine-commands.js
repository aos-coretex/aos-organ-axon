/**
 * Spine command handlers for Axon organ.
 *
 * Axon receives directed commands from other organs or humans via Spine mailbox.
 * Axon also sends directed OTMs to other organs when the human triggers UI actions.
 */

import { broadcast } from '../ws/ui-ws.js';

/**
 * Handle a directed message received via Spine mailbox.
 *
 * @param {object} envelope - Spine message envelope
 * @param {string} envelope.event_type - Command type
 * @param {object} envelope.payload - Command data
 * @param {string} [envelope.reply_to] - Organ to auto-reply to
 * @returns {object|null} - Reply payload (auto-sent if reply_to is set), or null
 */
export async function handleAxonCommand(envelope) {
  const { event_type, payload } = envelope;

  switch (event_type) {
    case 'dashboard_refresh':
      // Push refresh signal to all connected UI clients
      broadcast('dashboard_refresh', payload || {});
      return { status: 'refreshed' };

    case 'notification':
      // Push notification to UI (toast, banner)
      broadcast('notification', payload || { message: 'Unknown notification' });
      return { status: 'delivered' };

    default:
      return null;
  }
}

/**
 * Forward Spine broadcast events to connected UI WebSocket clients.
 * Called by the organ-boot onBroadcast callback.
 *
 * @param {object} envelope - Spine broadcast envelope
 */
export function pushToUiClients(envelope) {
  const eventType = envelope.event_type || envelope.type || 'unknown';
  broadcast(eventType, envelope.payload || envelope);
}

/**
 * Send a directed OTM to another organ via Spine.
 * Used when the human triggers an action in the UI.
 *
 * Spine's OTM schema requires `event_type` and `source` to be nested INSIDE
 * `payload`, alongside the caller's domain `data`. Envelope-level fields
 * are limited to `type`, `source_organ`, `target_organ` (plus optional
 * `correlation_id` / `reply_to`). Placing `event_type` at the envelope
 * level causes Spine to reject with SCHEMA_VALIDATION_FAILED.
 *
 * @param {object} spine - SpineClient instance
 * @param {string} targetOrgan - Destination organ name
 * @param {string} eventType - OTM event type (lands in payload.event_type)
 * @param {object} data - Domain data for the target handler (lands in payload.data)
 * @returns {Promise<object>} - Spine send result
 */
export async function sendCommand(spine, targetOrgan, eventType, data) {
  return spine.send({
    type: 'OTM',
    source_organ: 'Axon',
    target_organ: targetOrgan,
    payload: { event_type: eventType, source: 'Axon', data: data ?? {} },
  });
}

/**
 * Factory for Express route handlers that dispatch OTMs to other organs.
 * Creates routes like: POST /api/dispatch/vigil/run_tests
 *
 * @param {object} spine - SpineClient instance
 * @returns {object} Route handler map
 */
export function createDispatchRoutes(spine) {
  return {
    runTests: (req, res) =>
      dispatchAndRespond(spine, 'Vigil', 'run_tests', req.body, res),
    approveFix: (req, res) =>
      dispatchAndRespond(spine, 'Glia', 'approve_fix', req.body, res),
    triggerBackup: (req, res) =>
      dispatchAndRespond(spine, 'SafeVault', 'backup_command', req.body, res),
    syncRepos: (req, res) =>
      dispatchAndRespond(spine, 'GitSync', 'sync_all', req.body, res),
  };
}

async function dispatchAndRespond(spine, target, eventType, payload, res) {
  try {
    const result = await sendCommand(spine, target, eventType, payload || {});
    res.json({ dispatched: true, target, event_type: eventType, result });
  } catch (err) {
    res.status(502).json({ dispatched: false, target, event_type: eventType, error: err.message });
  }
}
