import test from 'node:test';
import assert from 'node:assert/strict';
import { buildReportExport, calculateStorePerformance, downloadJsonReport, filterReportOrders, loadReportOrders, summarizeOrders } from './adminReportData.js';

test('reports load backend orders that are absent from browser-local order storage', async () => {
  const backendOrder = { id: 'backend-only-order', status: 'DELIVERED', total: 75 };
  const localOrders = [];
  const orders = await loadReportOrders(async () => [backendOrder]);
  assert.deepEqual(localOrders, []);
  assert.deepEqual(orders, [backendOrder]);
  assert.equal(filterReportOrders(orders, { from: '', to: '', location: 'All', store: 'All' }).length, 1);
});

test('reports reject invalid backend order responses instead of treating them as an empty collection', async () => {
  await assert.rejects(loadReportOrders(async () => ({ content: [] })), /invalid report collection/);
});

test('backend order loading counts an order ID once after adaptation', async () => {
  const orders = await loadReportOrders(async () => [
    { id: 'same-id', status: 'CREATED', totalAmount: 10 },
    { id: 'same-id', status: 'DELIVERED', totalAmount: 25 },
  ], (order) => order);
  assert.deepEqual(orders, [{ id: 'same-id', status: 'DELIVERED', totalAmount: 25 }]);
  assert.deepEqual(summarizeOrders(orders), { total: 1, created: 0, delivered: 1, cancelled: 0, revenue: 25 });
});

test('backend order loading rejects a malformed order rather than silently omitting it', async () => {
  await assert.rejects(loadReportOrders(async () => [{ id: '  ', status: 'DELIVERED' }]), /without an ID/);
});

test('report totals use backend totalAmount when total is absent', () => {
  const payload = buildReportExport({
    filters: { from: '', to: '', location: 'All', store: 'All' },
    orders: [{ id: 'backend-1', status: 'DELIVERED', totalAmount: 125 }],
    storePerformance: [],
  });
  assert.equal(payload.summary.revenue, 125);
  assert.equal(payload.orders[0].total, 125);
});

test('dashboard and reports share order counts, delivered status, and cancelled revenue rules', () => {
  const summary = summarizeOrders([
    { id: 'created', status: 'created', totalAmount: 10 },
    { id: 'delivered', status: 'DELIVERED', total: 25 },
    { id: 'cancelled', status: 'CANCELLED', totalAmount: 100 },
    { id: 'canceled', status: 'Canceled', total: 50 },
    { id: 'missing-total', status: 'PROCESSING' },
    { id: 'invalid-total', status: 'PROCESSING', total: 'not-a-number' },
  ]);
  assert.deepEqual(summary, { total: 6, created: 1, delivered: 1, cancelled: 2, revenue: 35 });
});

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
