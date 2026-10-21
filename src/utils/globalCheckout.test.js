import test from 'node:test';
import assert from 'node:assert/strict';
import { isGlobalProduct, deliveryProducts } from './storeDelivery.js';
import { validateGlobalCheckout, checkoutErrorMessage } from './globalCheckout.js';

test('category and stale global labels cannot grant eligibility', () => {
  for (const globalProduct of [false, undefined]) {
    assert.equal(isGlobalProduct({ globalProduct, category: 'Dry Fruits', fulfillmentType: 'global', global: true }), false);
  }
  assert.equal(isGlobalProduct({ globalProduct: true }), true);
  const product = { id: 'p', globalProduct: false, category: 'Dry Fruits' };
  assert.deepEqual(deliveryProducts([product], [{ productId: 'p', storeId: 'global-store', product }],
    [{ id: 'global-store', name: 'Global' }], null), []);
});

test('saved global carts are checked against current catalog eligibility', async () => {
  const groups = [{ line: { fulfillmentType: 'global' }, items: [{ productId: 'p', productName: 'Raisins', globalProduct: true }] }];
  await assert.rejects(validateGlobalCheckout(groups, async () => ({ globalProduct: false })), /Raisins is not eligible/);
  await validateGlobalCheckout(groups, async () => ({ globalProduct: true }));
  await assert.rejects(validateGlobalCheckout(groups, async () => { throw new Error('Catalog unavailable'); }), /Catalog unavailable/);
});

test('local checkout does not require global eligibility', async () => {
  await validateGlobalCheckout([{ line: { fulfillmentType: 'nearby' }, items: [{ productId: 'p' }] }],
    async () => { assert.fail('Local item should not be checked'); });
});

test('checkout preserves backend explanations with old and new status codes', () => {
  for (const status of [422, 503]) {
    assert.equal(checkoutErrorMessage({ status, payload: { message: 'Product is not eligible for global delivery.' } }),
      'Product is not eligible for global delivery.');
  }
  assert.match(checkoutErrorMessage({ status: 503 }), /service may be unavailable/);
});
