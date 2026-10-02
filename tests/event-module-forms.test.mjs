import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

registerHooks({ resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) return nextResolve(new URL(`../src/${specifier.slice(2)}.ts`, import.meta.url).href, context);
  return nextResolve(specifier, context);
} });
const helpers = () => import('../src/lib/event-module-forms.ts');

test('inactive unlock metadata cannot block switching back to an unlocked listing', async () => {
  const { moduleSchema, modulePayload, emptyModuleRow } = await helpers();
  const row = { ...emptyModuleRow('shop_items'), currency_code: 'token', unlock: { type: 'none', level: NaN, at: 'invalid stale date' } };
  assert.equal(moduleSchema('shop_items', [{ currency_code: 'token' }]).safeParse({ missions: [], currencies: [], shop_items: [row], milestones: [] }).success, true);
  assert.deepEqual(modulePayload('shop_items', [row])[0].unlock, { type: 'none' });
});

test('schema validates the active module only, including all mission condition types', async () => {
  const { moduleSchema, emptyModuleRow } = await helpers();
  const { MISSION_CONDITION_TYPES } = await import('../src/schemas/event.ts');
  for (const type of MISSION_CONDITION_TYPES) {
    const mission = { ...emptyModuleRow('missions'), mission_code: 'win', name_english: 'Win', condition: { type, target: 1, filters: {} } };
    const parsed = moduleSchema('missions', []).safeParse({ missions: [mission], currencies: [], shop_items: [], milestones: [] });
    assert.equal(parsed.success, true, type);
  }
  const currency = { ...emptyModuleRow('currencies'), currency_code: 'token', name_english: 'Token' };
  assert.equal(moduleSchema('currencies', []).safeParse({ missions: [{}], currencies: [currency], shop_items: [{}], milestones: [{}] }).success, true);
});

test('schema rejects missing references, duplicate codes, invalid numbers, dates and unlocks inline', async () => {
  const { moduleSchema, emptyModuleRow } = await helpers();
  const currency = { ...emptyModuleRow('currencies'), currency_code: 'token', name_english: 'Token' };
  const base = { missions: [], currencies: [], shop_items: [], milestones: [] };
  const duplicate = moduleSchema('currencies', []).safeParse({ ...base, currencies: [currency, currency] });
  assert.equal(duplicate.success, false);
  assert.ok(duplicate.error.issues.some(x => x.path.join('.') === 'currencies.1.currency_code'));
  const shop = { ...emptyModuleRow('shop_items'), currency_code: 'missing', rewards: [{ type: 'item', quantity: 1 }], available_from: '2026-10-02T00:00', available_until: '2026-10-01T00:00', unlock: { type: 'mission' } };
  const invalid = moduleSchema('shop_items', [currency]).safeParse({ ...base, shop_items: [shop] });
  assert.equal(invalid.success, false);
  for (const path of ['currency_code', 'rewards.0.item_id', 'available_until', 'unlock.mission_code']) assert.ok(invalid.error.issues.some(x => x.path.join('.') === `shop_items.0.${path}`), path);
  for (const target of [0, 1.5, NaN]) assert.equal(moduleSchema('milestones', []).safeParse({ ...base, milestones: [{ ...emptyModuleRow('milestones'), required_points: target }] }).success, false);
  assert.equal(moduleSchema('shop_items', [currency]).safeParse({ ...base, shop_items: [{ ...shop, available_from: 'bad-date' }] }).success, false);
});

test('payload removes stale reward/unlock/filter fields and persists ordering and UTC dates', async () => {
  const { modulePayload, emptyModuleRow } = await helpers();
  const shop = { ...emptyModuleRow('shop_items'), currency_code: 'token', display_order: 8, available_from: '2026-10-01T03:30', unlock: { type: 'none', mission_code: 'stale' }, rewards: [{ type: 'crown', quantity: 3, item_id: 'stale' }] };
  const [saved, next] = modulePayload('shop_items', [shop, { ...shop, price: 4 }]);
  assert.equal(saved.display_order, 0);
  assert.equal(next.display_order, 1);
  assert.equal(saved.available_from, '2026-10-01T03:30:00.000Z');
  assert.equal(saved.available_until, undefined);
  assert.deepEqual(saved.unlock, { type: 'none' });
  assert.deepEqual(saved.rewards, [{ type: 'crown', quantity: 3 }]);
  const mission = { ...emptyModuleRow('missions'), mission_code: 'win', name_english: 'Win', condition: { type: 'LOGIN', target: 1, filters: { realm: '', rarity: 0 } }, starts_at: '2026-10-01T03:30' };
  assert.deepEqual(modulePayload('missions', [mission])[0].condition.filters, { rarity: 0 });
  assert.equal(modulePayload('missions', [mission])[0].starts_at, '2026-10-01T03:30:00.000Z');
});

test('currency, shop and milestone defaults preserve zero and normalize dates as UTC', async () => {
  const { moduleFormValues, utcInput, utcIso, optionalNumber } = await helpers();
  const values = moduleFormValues({ currencies: [{ currency_code: 'token', name_english: 'Token', max_carry: 0 }], shop_items: [{ price: 2, currency_code: 'token', available_from: '2026-10-01T10:30:00+07:00' }], milestones: [{ required_points: 3 }] });
  assert.equal(values.currencies[0].icon_image, '');
  assert.equal(values.currencies[0].max_carry, 0);
  assert.deepEqual(values.shop_items[0].unlock, { type: 'none' });
  assert.deepEqual(values.shop_items[0].rewards, []);
  assert.equal(values.milestones[0].claimable, true);
  assert.equal(values.shop_items[0].available_from, '2026-10-01T03:30:00.000');
  assert.equal(utcInput(''), '');
  assert.equal(utcIso(''), undefined);
  assert.equal(utcIso('2026-10-01T03:30'), '2026-10-01T03:30:00.000Z');
  assert.equal(optionalNumber(''), undefined);
  assert.equal(optionalNumber('0'), 0);
  assert.ok(Number.isNaN(optionalNumber('invalid')));
});

test('mission defaults fill absent optional fields without mutating stored data', async () => {
  const { moduleFormValues } = await helpers();
  const source = { missions: [{ mission_code: 'win', name_english: 'Win', condition: { type: 'LOGIN', target: 1 }, rewards: [{ type: 'crown', quantity: 1 }] }] };
  const values = moduleFormValues(source);
  assert.equal(values.missions[0].name_indonesia, '');
  assert.deepEqual(values.missions[0].condition.filters, {});
  assert.equal(values.missions[0].repeatable, false);
  assert.equal(values.missions[0].reset_type, 'none');
  assert.deepEqual(values.currencies, []);
  assert.equal(source.missions[0].name_indonesia, undefined);
});
