import test from 'node:test';
import assert from 'node:assert/strict';

test('module payload omits unused blank reward references', async () => {
  const { eventSavePayload } = await import('../src/lib/event-payload.ts');
  const result = eventSavePayload({ missions: [{ rewards: [{ type: 'crown', quantity: 1, item_id: '', card_id: '', currency_code: '' }] }] });
  assert.deepEqual(result.missions[0].rewards[0], { type: 'crown', quantity: 1 });
});

test('module saves strip database metadata recursively and preserve other modules', async () => {
  const { eventSavePayload } = await import('../src/lib/event-payload.ts');
  const event = { _id: 'db-id', __v: 0, requires_reschedule: true, createdAt: 'date', updatedAt: 'date', template: 'standard',
    code: 'demo', status: 'draft', stages: [{ _id: 'stage-id', name_english: 'Existing' }],
    missions: [{ _id: 'mission-id', rewards: [{ _id: 'reward-id', type: 'crown', quantity: 1 }] }] };
  const result = eventSavePayload(event, { stages: [{ _id: 'new-id', name_english: 'Changed' }] });
  assert.deepEqual(result, { code: 'demo', status: 'draft', stages: [{ name_english: 'Changed' }],
    missions: [{ rewards: [{ type: 'crown', quantity: 1 }] }] });
  assert.equal(event.stages[0].name_english, 'Existing');
});
