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

  it('4. sendCommand constructs correct OTM', async () => {
    let captured = null;
    const mockSpine = {
      send: async (msg) => {
        captured = msg;
        return { message_id: 'mock-id' };
      },
    };

    await sendCommand(mockSpine, 'Vigil', 'run_tests', { test_ids: ['t1'] });

    assert.equal(captured.type, 'OTM');
    assert.equal(captured.source_organ, 'Axon');
    assert.equal(captured.target_organ, 'Vigil');
    assert.equal(captured.event_type, 'run_tests');
    assert.deepEqual(captured.payload, { test_ids: ['t1'] });
  });

  it('5. createDispatchRoutes returns all four handlers', () => {
    const mockSpine = { send: async () => ({}) };
    const dispatch = createDispatchRoutes(mockSpine);

    assert.equal(typeof dispatch.runTests, 'function');
    assert.equal(typeof dispatch.approveFix, 'function');
    assert.equal(typeof dispatch.triggerBackup, 'function');
    assert.equal(typeof dispatch.syncRepos, 'function');
  });
});
