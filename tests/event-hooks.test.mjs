import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import { eventSavePayload } from '../src/lib/event-payload.ts';

function hooks() {
  const calls = [], invalidated = [];
  const stored = { _id: 'abc', code: 'demo', status: 'draft', createdAt: 'date', missions: [{ mission_code: 'keep' }], stages: [] };
  const exports = {};
  const require = createRequire(import.meta.url);
  const code = ts.transpileModule(readFileSync(new URL('../src/hooks/use-events.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(code, { exports, require(name) {
    if (name === '@tanstack/react-query') return { useMutation: options => options, useQueryClient: () => ({ invalidateQueries: ({ queryKey }) => invalidated.push(Array.from(queryKey)) }) };
    if (name === '@/lib/client-api') return { clientApi: async (url, options) => { calls.push({ url, options }); return options ? { ...stored, ...JSON.parse(options.body || '{}') } : stored; } };
    if (name === '@/lib/event-payload') return { eventSavePayload };
    if (name === '@/hooks/use-admin-query') return { useAdminQuery() {} };
    return require(name);
  }, URLSearchParams });
  return { exports, calls, invalidated };
}

test('module mutation reads through query proxy, strips metadata and preserves unrelated modules', async () => {
  const { exports, calls } = hooks();
  const result = await exports.useSaveEventModule().mutationFn({ eventId: 'abc', field: 'stages', payload: [{ name_english: 'New stage' }] });
  assert.equal(calls[0].url, '/api/admin/query/events/abc');
  assert.equal(calls[1].options.method, 'PUT');
  const payload = JSON.parse(calls[1].options.body);
  assert.equal('_id' in payload, false);
  assert.deepEqual(payload.missions, [{ mission_code: 'keep' }]);
  assert.deepEqual(result.stages, [{ name_english: 'New stage' }]);
});

test('event mutations invalidate options as well as lists and validation', () => {
  const { exports, invalidated } = hooks();
  exports.useSaveEvent().onSuccess({ _id: 'abc' });
  assert.ok(invalidated.some(key => key[0] === 'event-options'));
});
