/**
 * Tests for Spine command handlers.
 * Tests handler functions directly with mock envelopes (no Spine connection).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { handleAxonCommand, sendCommand, createDispatchRoutes } from '../server/handlers/spine-commands.js';

describe('Axon Spine command handlers', () => {

  it('1. dashboard_refresh returns refreshed status', async () => {
    const result = await handleAxonCommand({
      event_type: 'dashboard_refresh',
      payload: { reason: 'manual' },
    });
    assert.deepEqual(result, { status: 'refreshed' });
  });

  it('2. notification returns delivered status', async () => {
    const result = await handleAxonCommand({
      event_type: 'notification',
      payload: { message: 'Test notification', level: 'info' },
    });
    assert.deepEqual(result, { status: 'delivered' });
  });

  it('3. unknown command returns null', async () => {
    const result = await handleAxonCommand({
      event_type: 'some_unknown_command',
      payload: {},
    });
    assert.equal(result, null);
  });

  it('4. sendCommand constructs correct OTM envelope shape', async () => {
    let captured = null;
    const mockSpine = {
      send: async (msg) => {
        captured = msg;
        return { message_id: 'mock-id' };
      },
    };

    await sendCommand(mockSpine, 'Vigil', 'run_tests', { group: 'databases' });

    assert.deepEqual(captured, {
      type: 'OTM',
      source_organ: 'Axon',
      target_organ: 'Vigil',
      payload: {
        event_type: 'run_tests',
        source: 'Axon',
        data: { group: 'databases' },
      },
    });
  });

  it('5. createDispatchRoutes returns all four handlers', () => {
    const mockSpine = { send: async () => ({}) };
    const dispatch = createDispatchRoutes(mockSpine);

    assert.equal(typeof dispatch.runTests, 'function');
    assert.equal(typeof dispatch.approveFix, 'function');
    assert.equal(typeof dispatch.triggerBackup, 'function');
    assert.equal(typeof dispatch.syncRepos, 'function');
  });

  it('6. sendCommand defaults missing data to empty object', async () => {
    let captured = null;
    const mockSpine = { send: async (msg) => { captured = msg; return {}; } };

    await sendCommand(mockSpine, 'Vigil', 'run_tests');

    assert.deepEqual(captured.payload.data, {});
    assert.equal(captured.payload.event_type, 'run_tests');
    assert.equal(captured.payload.source, 'Axon');
  });

  it('7. sendCommand handles null data', async () => {
    let captured = null;
    const mockSpine = { send: async (msg) => { captured = msg; return {}; } };

    await sendCommand(mockSpine, 'Glia', 'approve_fix', null);

    assert.deepEqual(captured.payload.data, {});
  });

  it('8. sendCommand never places event_type at envelope level (schema-shape guard)', async () => {
    let captured = null;
    const mockSpine = { send: async (msg) => { captured = msg; return {}; } };

    await sendCommand(mockSpine, 'GitSync', 'sync_all', { mode: 'dry-run' });

    assert.equal(captured.event_type, undefined,
      'event_type must NOT be at envelope level (Spine rejects with SCHEMA_VALIDATION_FAILED)');
    assert.equal(typeof captured.payload.event_type, 'string',
      'event_type must be nested inside payload');
  });

  it('9. dispatchAndRespond route handler passes through correctly-shaped envelope', async () => {
    let captured = null;
    const mockSpine = {
      send: async (msg) => { captured = msg; return { status: 'accepted', message_id: 'm1' }; },
    };
    const dispatch = createDispatchRoutes(mockSpine);

    let responded = null;
    const mockRes = {
      json: (body) => { responded = { code: 200, body }; return mockRes; },
      status: (code) => ({ json: (body) => { responded = { code, body }; return mockRes; } }),
    };
    const mockReq = { body: { ticket: 'smoke' } };

    await dispatch.approveFix(mockReq, mockRes);

    assert.deepEqual(captured, {
      type: 'OTM',
      source_organ: 'Axon',
      target_organ: 'Glia',
      payload: { event_type: 'approve_fix', source: 'Axon', data: { ticket: 'smoke' } },
    });
    assert.equal(responded.code, 200);
    assert.equal(responded.body.dispatched, true);
    assert.equal(responded.body.target, 'Glia');
    assert.equal(responded.body.event_type, 'approve_fix');
    assert.deepEqual(responded.body.result, { status: 'accepted', message_id: 'm1' });
  });
});
