import test from 'node:test';
import assert from 'node:assert/strict';
import { getAllInventories, getInventories } from './inventoryApi.js';
import { filterInventoryRecords, matchesInventoryStatus, paginateInventoryRecords } from '../utils/inventoryList.js';

const withFetch = async (fetchImpl, callback) => {
  const originalFetch = globalThis.fetch;
  const originalStorage = globalThis.sessionStorage;
  globalThis.fetch = fetchImpl;
  globalThis.sessionStorage = { getItem: () => null };
  try { await callback(); }
  finally { globalThis.fetch = originalFetch; globalThis.sessionStorage = originalStorage; }
};

const jsonResponse = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json' },
});

test('getInventories forwards page, size, sort, and explicit status parameters', async () => {
  await withFetch(async (url) => {
    const query = new URL(url, 'http://localhost').searchParams;
    assert.equal(query.get('page'), '3');
    assert.equal(query.get('size'), '25');
    assert.equal(query.get('sort'), 'updatedAt,desc');
    assert.equal(query.get('status'), 'INACTIVE');
    return jsonResponse({ content: [], page: 3, size: 25, totalElements: 0, totalPages: 0 });
  }, async () => {
    await getInventories({ page: 3, size: 25, sort: 'updatedAt,desc', status: 'INACTIVE' });
  });
});

test('getAllInventories retrieves later backend pages, includes later records, and deduplicates IDs', async () => {
  const requests = [];
  const existing = { id: 'inventory-1', status: 'ACTIVE' };
  const laterRecord = { id: 'test-record-on-page-1', status: 'INACTIVE' };
  await withFetch(async (url) => {
    const query = new URL(url, 'http://localhost').searchParams;
    const page = Number(query.get('page'));
    requests.push(page);
    assert.equal(query.get('status'), null, 'All inventory statuses must be requested');
    assert.equal(query.get('sort'), 'id,asc', 'Inventory pages need a stable unique sort key');
    return page === 0
      ? jsonResponse({ content: [existing], page: 0, size: 50, totalElements: 2, totalPages: 2 })
      : jsonResponse({ content: [existing, laterRecord], page: 1, size: 50, totalElements: 2, totalPages: 2 });
  }, async () => {
    const records = await getAllInventories({ size: 50 });
    assert.deepEqual(requests, [0, 1]);
    assert.equal(records.length, 2);
    assert.ok(records.some((record) => record.id === laterRecord.id));
  });
});

test('getAllInventories rejects a later-page API error instead of returning partial results', async () => {
  await withFetch(async (url) => {
    const page = Number(new URL(url, 'http://localhost').searchParams.get('page'));
    return page === 0
      ? jsonResponse({ content: [{ id: 'inventory-1' }], page: 0, size: 50, totalElements: 51, totalPages: 2 })
      : jsonResponse({ message: 'Inventory page unavailable' }, 503);
  }, async () => {
    await assert.rejects(getAllInventories({ size: 50 }), /Inventory page unavailable/);
  });
});

test('inventory status filter supports All, Active, and Inactive', () => {
  const active = { status: 'ACTIVE' };
  const inactive = { status: 'INACTIVE' };
  assert.equal(matchesInventoryStatus(active, 'All'), true);
  assert.equal(matchesInventoryStatus(inactive, 'All'), true);
  assert.equal(matchesInventoryStatus(active, 'Active'), true);
  assert.equal(matchesInventoryStatus(inactive, 'Active'), false);
  assert.equal(matchesInventoryStatus(active, 'Inactive'), false);
  assert.equal(matchesInventoryStatus(inactive, 'Inactive'), true);
});

test('inventory list preserves search, sorting, and client pagination', () => {
  const records = [
    { id: 'inv-b', name: 'Beta nuts', status: 'ACTIVE', createdAt: '2026-10-22' },
    { id: 'inv-a', name: 'Alpha nuts', status: 'INACTIVE', createdAt: '2026-10-20' },
    { id: 'inv-c', name: 'Alpha spice', status: 'ACTIVE', createdAt: '2026-10-21' },
  ];
  const matching = filterInventoryRecords(records, { query: 'alpha', status: 'All', sort: 'name' });
  assert.deepEqual(matching.map((record) => record.id), ['inv-a', 'inv-c']);
  assert.deepEqual(paginateInventoryRecords(matching, 2, 1).map((record) => record.id), ['inv-c']);
  assert.deepEqual(filterInventoryRecords(records, { query: 'alpha', status: 'Active', sort: 'oldest' }).map((record) => record.id), ['inv-c']);
});

