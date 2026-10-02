import test from 'node:test';
import assert from 'node:assert/strict';

test('story form retains event currencies and fills optional stage fields', async () => {
  const { storyFormValues } = await import('../src/lib/event-payload.ts');
  const stage = { stage_number: 1, name_english: 'Border', difficulty: 'normal', repeatable: true, unlock: { type: 'none' } };
  const { stages } = storyFormValues({ stages: [stage] });
  assert.equal(stages[0].name_indonesia, '');
  assert.deepEqual(stages[0].enemy_ids, []);
  assert.deepEqual(stages[0].repeat_rewards, []);
  assert.equal(stages[0].energy_cost, 0);
  assert.deepEqual(stage.unlock, { type: 'none' });
});
