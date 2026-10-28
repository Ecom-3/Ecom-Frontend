import test from 'node:test';
import assert from 'node:assert/strict';
import { assignGlobalStore, getGlobalStoreAssignmentOptions, getOrder, normalizeOrder } from './orderApi.js';

const withFetch = async (fetchImpl, callback) => {
  const previousFetch = globalThis.fetch;
  const previousStorage = globalThis.sessionStorage;
  globalThis.fetch = fetchImpl;
  globalThis.sessionStorage = { getItem: () => 'test-token' };
  try { await callback(); }
  finally { globalThis.fetch = previousFetch; globalThis.sessionStorage = previousStorage; }
};

const jsonResponse = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json' },
});

test('normalizes pickup orders as Store Pickup instead of showing a delivery ETA', () => {
  const order = normalizeOrder({
    id: 'pickup-order',
    deliveryMethod: 'pickup',
    items: [{ productId: 'product-1', deliveryMethod: 'pickup' }],
  });

  assert.equal(order.deliveryType, 'pickup');
  assert.equal(order.deliveryLabel, 'Store Pickup');
  assert.equal(order.items[0].deliveryLabel, 'Store Pickup');
});

test('global assignment workflow loads a backend-only order and stocked options without local order storage', async () => {
  const calls = [];
  await withFetch(async (url, options = {}) => {
    calls.push({ url: String(url), options });
    if (String(url).includes('global-store-assignment-options')) return jsonResponse([{ storeId: 'store-hyd', items: [{ productName: 'Pickle jar', requestedQuantity: 2, availableQuantity: 5, available: true }] }]);
    return jsonResponse({ id: 'backend-order-only', storeId: 'global-store', fulfillmentType: 'global', items: [] });
  }, async () => {
    const order = await getOrder('backend-order-only');
    const options = await getGlobalStoreAssignmentOptions(order.id);
    assert.equal(order.id, 'backend-order-only');
    assert.equal(options[0].storeId, 'store-hyd');
    assert.equal(calls.length, 2);
    assert.ok(calls.every(({ options: requestOptions }) => requestOptions.headers.Authorization === 'Bearer test-token'));
  });
});

test('assignment sends the selected store to the authenticated backend operation', async () => {
  await withFetch(async (url, options) => {
    assert.match(String(url), /\/api\/v1\/orders\/backend-order-only\/global-store-assignment$/);
    assert.equal(options.method, 'POST');
    assert.equal(options.headers.Authorization, 'Bearer test-token');
    assert.deepEqual(JSON.parse(options.body), { storeId: 'store-hyd' });
    return jsonResponse({ id: 'backend-order-only', globalAssignedStoreId: 'store-hyd', globalApproval: 'Approved' });
  }, async () => {
    const result = await assignGlobalStore('backend-order-only', 'store-hyd');
    assert.equal(result.globalAssignedStoreId, 'store-hyd');
  });
});
