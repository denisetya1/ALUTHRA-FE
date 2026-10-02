import test from 'node:test';
import assert from 'node:assert/strict';

test('reward array uses the supplied path without appending another rewards segment', async () => {
  const { rewardArrayPath } = await import('../src/lib/event-editor-fields.ts');
  assert.equal(rewardArrayPath('stages.0.first_clear_rewards'), 'stages.0.first_clear_rewards');
  assert.equal(rewardArrayPath('missions.0.rewards'), 'missions.0.rewards');
});

test('overview timestamps round-trip local timezone and omit blank optional dates', async () => {
  const { toLocalDateTime, overviewSavePayload } = await import('../src/lib/event-editor-fields.ts');
  process.env.TZ = 'Asia/Jakarta';
  assert.equal(toLocalDateTime('2026-10-01T00:00:00.000Z'), '2026-10-01T07:00');
  const saved = overviewSavePayload({ start_at: '2026-10-01T07:00', end_at: '2026-10-02T07:00', visibility_start_at: '', visibility_end_at: '' });
  assert.equal(saved.start_at, '2026-10-01T00:00:00.000Z');
  assert.equal('visibility_start_at' in saved, false);
});
