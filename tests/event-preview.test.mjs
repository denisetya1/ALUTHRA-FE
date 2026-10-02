import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

function loadTs(file, overrides = {}) {
  const filename = path.resolve(file);
  const compiled = { exports: {} };
  const nativeRequire = createRequire(filename);
  const require = (id) => {
    if (id in overrides) return overrides[id];
    if (!id.startsWith('@/') && !id.startsWith('.')) return nativeRequire(id);
    const base = id.startsWith('@/') ? path.resolve('src', id.slice(2)) : path.resolve(path.dirname(filename), id);
    const resolved = [base, `${base}.ts`, `${base}.tsx`].find(existsSync);
    return loadTs(resolved, overrides);
  };
  const code = ts.transpileModule(readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  new Function('require', 'module', 'exports', code)(require, compiled, compiled.exports);
  return compiled.exports;
}

test('story keeps accessible reorder controls outside the fieldset grid layout bug', async () => {
  const { newStoryStage } = await import('../src/lib/event-preview.ts');
  const { default: StoryEditor } = loadTs('src/app/admin/events/[id]/story/story-editor.tsx', {
    'next/navigation': { useParams: () => ({ id: 'test-id' }), useRouter: () => ({ refresh() {} }) },
    '@/hooks/use-events': { useSaveEventModule: () => ({ isPending: false }) },
    '@/hooks/use-admin-options': { useCardOptions: () => ({ data: { data: [] } }), useItemOptions: () => ({ data: { data: [] } }) },
  });
  const event = { stages: [newStoryStage(0)], currencies: [], modules: { story: true } };
  const html = renderToStaticMarkup(React.createElement(StoryEditor, { event }));
  assert.match(html, /aria-label="Move stage 1 down"/);
  assert.match(html, /draggable="true"/);
  assert.match(html, /<fieldset[^>]*><div class="[^"]*grid/);
});

test('preview renders stored name, assets, stage rewards and honest empty modules', () => {
  const { EventPreviewDisplay, EventPreviewHeader } = loadTs('src/app/admin/events/[id]/preview/components/event-preview-display.tsx');
  const event = { name_english: 'Harvest Moon', banner_image: 'https://example.test/banner.png', modules: { story: true, missions: true }, stages: [{ stage_number: 1, name_english: 'Arrival', difficulty: 'normal', unlock: { type: 'none' }, first_clear_rewards: [{ type: 'card', card_id: 'saved-card', quantity: 1 }], repeat_rewards: [] }], missions: [], currencies: [] };
  const header = renderToStaticMarkup(React.createElement(EventPreviewHeader, { event, countdown: 'Starts in 1h 0m 0s' }));
  assert.match(header, /Harvest Moon/);
  assert.match(header, /https:\/\/example.test\/banner.png/);
  assert.match(header, /Starts in 1h/);
  const story = renderToStaticMarkup(React.createElement(EventPreviewDisplay, { event, tab: 'story' }));
  assert.match(story, /Arrival/);
  assert.match(story, /saved-card/);
  assert.doesNotMatch(story, /players|conversion|completion rate/i);
  const missions = renderToStaticMarkup(React.createElement(EventPreviewDisplay, { event, tab: 'missions' }));
  assert.match(missions, /No missions configured/);
});

test('preview countdown follows schedule and never fabricates player statistics', async () => {
  const { eventCountdown, previewTabs, publishBlockReason, rewardLabel } = await import('../src/lib/event-preview.ts');
  const event = { status: 'draft', start_at: '2026-10-01T12:00:00Z', end_at: '2026-10-02T12:00:00Z', modules: { story: true, missions: true, shop: false, currency: true, milestones: true, boss: true } };
  assert.equal(eventCountdown(event, Date.parse('2026-10-01T11:00:00Z')), 'Starts in 1h 0m 0s');
  assert.equal(eventCountdown(event, Date.parse('2026-10-01T13:00:00Z')), 'Ends in 23h 0m 0s');
  assert.equal(eventCountdown(event, Date.parse(event.end_at)), 'Event ended');
  assert.equal(eventCountdown({ ...event, start_at: 'invalid' }, 0), 'Schedule unavailable');
  assert.deepEqual(previewTabs(event), ['story', 'missions', 'currency', 'milestones']);
  assert.equal(publishBlockReason(event, []), null);
  assert.equal(publishBlockReason(event, undefined), 'Validation must complete before publishing.');
  assert.match(publishBlockReason(event, [{ level: 'error' }]), /validation/);
  assert.match(publishBlockReason({ ...event, status: 'active' }, []), /published/);
  assert.equal(rewardLabel({ type: 'event_currency', currency_code: 'petals', quantity: 3 }), '3 × petals');
  assert.equal(rewardLabel({ type: 'card', card_id: 'card-123', quantity: 1 }), '1 × Card card-123');
});

 test('story defaults and reordered save preserve business IDs and remap stage references', async () => {
  const { newStoryStage, storyStagesPayload } = await import('../src/lib/event-preview.ts');
  assert.equal(newStoryStage(0).unlock.type, 'none');
  assert.equal(newStoryStage(1).unlock.type, 'previous_stage');
  const stages = [
    { ...newStoryStage(1), stage_number: 2, enemy_ids: ['enemy-id'], first_clear_rewards: [{ type: 'card', card_id: 'card-id', quantity: 1 }], unlock: { type: 'previous_stage', stage_number: 1 } },
    { ...newStoryStage(0), stage_number: 1 },
  ];
  const result = storyStagesPayload(stages);
  assert.equal(result[0].stage_number, 1);
  assert.deepEqual(result[0].unlock, { type: 'previous_stage', stage_number: 2 });
  assert.deepEqual(result[0].enemy_ids, ['enemy-id']);
  assert.equal(result[0].first_clear_rewards[0].card_id, 'card-id');
  assert.equal(stages[0].stage_number, 2);
 });

test('story reorder refuses to silently retarget mission or shop stage references', async () => {
  const { newStoryStage, storyStagesPayload } = await import('../src/lib/event-preview.ts');
  const stages = [{ ...newStoryStage(1), stage_number: 2 }, { ...newStoryStage(0), stage_number: 1 }];
  assert.throws(() => storyStagesPayload(stages, [1]), /mission or shop/);
  assert.doesNotThrow(() => storyStagesPayload(stages, []));
});

test('story save rejects removed references and clears inactive unlock metadata', async () => {
  const { newStoryStage, storyStagesPayload } = await import('../src/lib/event-preview.ts');
  assert.throws(() => storyStagesPayload([{ ...newStoryStage(0), unlock: { type: 'previous_stage', stage_number: 99 } }]), /removed stage/);
  assert.throws(() => storyStagesPayload([{ ...newStoryStage(0), unlock: { type: 'datetime', at: '' } }]), /valid date/);
  const result = storyStagesPayload([{ ...newStoryStage(0), unlock: { type: 'none', at: 'old date', mission_code: 'old-mission' } }]);
  assert.deepEqual(result[0].unlock, { type: 'none' });
});

test('story datetime values round-trip UTC instants through local form values', async () => {
  const { toLocalDateTime, toUtcDateTime } = await import('../src/lib/event-preview.ts');
  const prior = process.env.TZ;
  process.env.TZ = 'Asia/Jakarta';
  try {
    assert.equal(toLocalDateTime('2026-10-01T12:34:56.123Z'), '2026-10-01T19:34:56.123');
    assert.equal(toUtcDateTime('2026-10-01T19:34:56.123'), '2026-10-01T12:34:56.123Z');
    assert.equal(toLocalDateTime(''), '');
    assert.throws(() => toUtcDateTime('not a date'), /valid/);
  } finally { if (prior === undefined) delete process.env.TZ; else process.env.TZ = prior; }
});
