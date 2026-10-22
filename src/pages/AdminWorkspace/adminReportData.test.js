import test from 'node:test';
import assert from 'node:assert/strict';
import { buildReportExport, calculateStorePerformance, downloadJsonReport, filterReportOrders } from './adminReportData.js';

test('report filters apply the selected date range, location, and store', () => {
  const orders = [
    { id: '1', createdAt: '2026-10-20T10:00:00Z', sourceLocation: 'Hyderabad', sourceStore: 'Main' },
    { id: '2', createdAt: '2026-10-21T10:00:00Z', sourceLocation: 'Pune', sourceStore: 'Other' },
  ];
  assert.deepEqual(filterReportOrders(orders, { from: '2026-10-20', to: '2026-10-20', location: 'Hyderabad', store: 'Main' }), [orders[0]]);
});

test('store performance reflects filtered orders and chosen sort', () => {
  const stores = [{ name: 'A', location: 'Hyderabad' }, { name: 'B', location: 'Hyderabad' }];
  const orders = [{ sourceStore: 'A', total: 12, status: 'DELIVERED' }, { sourceStore: 'B', total: 40, status: 'CANCELLED' }];
  assert.deepEqual(calculateStorePerformance(stores, orders, 'revenue'), [
    { name: 'A', location: 'Hyderabad', orders: 1, revenue: 12 },
    { name: 'B', location: 'Hyderabad', orders: 1, revenue: 0 },
  ]);
});

test('JSON export contains selected filters and excludes private customer and payment details', () => {
  const source = {
    id: 'order-1', orderNumber: 'ORD-1', createdAt: '2026-10-22', status: 'DELIVERED', total: 12,
    sourceStore: 'Main', sourceLocation: 'Hyderabad', customer: { email: 'private@example.com' },
    payment: { token: 'secret' }, checkout: { deliveryAddress: 'private address' },
  };
  const payload = buildReportExport({ filters: { from: '', to: '', location: 'All', store: 'All', sort: 'revenue' }, orders: [source], storePerformance: [] });
  assert.deepEqual(payload.orders[0], {
    id: 'order-1', orderNumber: 'ORD-1', createdAt: '2026-10-22', status: 'DELIVERED',
    total: 12, store: 'Main', location: 'Hyderabad', fulfillmentType: null,
  });
  assert.doesNotMatch(JSON.stringify(payload), /private@example|secret|private address/);
  assert.equal(JSON.parse(JSON.stringify(payload)).summary.delivered, 1);
});

test('JSON export creates a dated download and keeps its object URL until scheduled cleanup', () => {
  let clickCount = 0;
  let removed = false;
  let revoked = false;
  let scheduled;
  let link;
  const documentRef = {
    body: { appendChild: (node) => { link = node; } },
    createElement: () => ({ style: {}, click: () => { clickCount += 1; }, remove: () => { removed = true; } }),
  };
  const urlApi = {
    createObjectURL: (blob) => { assert.equal(blob.type, 'application/json;charset=utf-8'); return 'blob:qa-report'; },
    revokeObjectURL: (url) => { assert.equal(url, 'blob:qa-report'); revoked = true; },
  };
  const filename = downloadJsonReport({ ok: true }, {
    documentRef, urlApi, now: new Date('2026-10-22T00:00:00Z'), schedule: (callback) => { scheduled = callback; },
  });
  assert.equal(filename, 'scoped-report-2026-10-22.json');
  assert.equal(link.href, 'blob:qa-report');
  assert.equal(clickCount, 1);
  assert.equal(removed, true);
  assert.equal(revoked, false);
  scheduled();
  assert.equal(revoked, true);
});

test('JSON export revokes its URL and reports an error when download initiation fails', () => {
  let revoked = false;
  const urlApi = { createObjectURL: () => 'blob:failed', revokeObjectURL: () => { revoked = true; } };
  const documentRef = {
    body: { appendChild: () => {} },
    createElement: () => ({ style: {}, click: () => { throw new Error('blocked'); }, remove: () => {} }),
  };
  assert.throws(() => downloadJsonReport({}, { documentRef, urlApi, schedule: () => {} }), /could not start the JSON download/);
  assert.equal(revoked, true);
});
