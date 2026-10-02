import test from 'node:test';
import assert from 'node:assert/strict';
import { rewardSchema } from '../src/schemas/event.ts';

test('item and card rewards require valid references', () => {
  assert.equal(rewardSchema.safeParse({ type: 'item', quantity: 1 }).success, false);
  assert.equal(rewardSchema.safeParse({ type: 'card', quantity: 1, card_id: 'bad' }).success, false);
  assert.equal(rewardSchema.safeParse({ type: 'event_currency', quantity: 1 }).success, false);
  assert.equal(rewardSchema.safeParse({ type: 'crown', quantity: 1 }).success, true);
});
