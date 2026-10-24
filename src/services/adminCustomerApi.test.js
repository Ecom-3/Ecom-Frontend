import test from 'node:test';
import assert from 'node:assert/strict';
import { getAllCustomers, getCustomerTotal, getCustomers } from './adminCustomerApi.js';

const withFetch = async (fetchImpl, callback) => {
  const originalFetch = globalThis.fetch;
  const originalStorage = globalThis.sessionStorage;
  globalThis.fetch = fetchImpl;
  globalThis.sessionStorage = { getItem: () => 'e30.eyJleHAiOjQwMDAwMDAwMDB9.sig' };
  try { await callback(); }
  finally { globalThis.fetch = originalFetch; globalThis.sessionStorage = originalStorage; }
};
const jsonResponse = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json' },
});

test('customer collection forwards pagination parameters', async () => {
  await withFetch(async (url) => {
    const query = new URL(url, 'http://localhost').searchParams;
    assert.equal(query.get('page'), '3');
    assert.equal(query.get('size'), '12');
    return jsonResponse({ content: [], page: 3, size: 12, totalElements: 0, totalPages: 0 });
  }, async () => { await getCustomers({ page: 3, size: 12 }); });
});

test('dashboard and reports can share the backend registered-customer total', async () => {
  await withFetch(async (url) => {
    const query = new URL(url, 'http://localhost').searchParams;
    assert.equal(query.get('page'), '0');
    assert.equal(query.get('size'), '1');
    return jsonResponse({ content: [{ id: 'only-the-first-record' }], page: 0, size: 1, totalElements: 8, totalPages: 8 });
  }, async () => assert.equal(await getCustomerTotal(), 8));
});

test('customer total rejects malformed pagination totals', async () => {
  await withFetch(async () => jsonResponse({ content: [], totalElements: 'unknown' }), async () => {
    await assert.rejects(getCustomerTotal(), /invalid total/);
  });
});

test('customer list retrieves later pages and deduplicates repeated IDs', async () => {
  const calls = [];
  await withFetch(async (url) => {
    const page = Number(new URL(url, 'http://localhost').searchParams.get('page'));
    calls.push(page);
    return page === 0
      ? jsonResponse({ content: [{ id: 'a' }, { id: 'b' }], page, size: 2, totalElements: 3, totalPages: 2 })
      : jsonResponse({ content: [{ id: 'b' }, { id: 'c' }], page, size: 2, totalElements: 3, totalPages: 2 });
  }, async () => {
    const records = await getAllCustomers({ size: 2 });
    assert.deepEqual(calls, [0, 1]);
    assert.deepEqual(records.map((record) => record.id), ['a', 'b', 'c']);
  });
});

test('customer list propagates authorization and later-page API errors', async () => {
  await withFetch(async (url) => new URL(url, 'http://localhost').searchParams.get('page') === '0'
    ? jsonResponse({ content: [{ id: 'a' }], page: 0, size: 1, totalElements: 2, totalPages: 2 })
    : jsonResponse({ message: 'Forbidden' }, 403), async () => {
    await assert.rejects(getAllCustomers({ size: 1 }), /permission|Forbidden/i);
  });
});
