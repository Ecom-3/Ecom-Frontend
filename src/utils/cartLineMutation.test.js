import test from 'node:test';
import assert from 'node:assert/strict';
import { planCartLineMutation, sameCartLine } from './cartLineMutation.js';

test('cart line identity includes product, variant, and store', () => {
  const line = { productId: 'p1', variantId: 'v1', storeId: 's1' };
  assert.equal(sameCartLine(line, { ...line, productId: 'p2' }), false);
  assert.equal(sameCartLine(line, { ...line, variantId: 'v2' }), false);
  assert.equal(sameCartLine(line, { ...line, storeId: 's2' }), false);
  assert.equal(sameCartLine({ ...line, productId: 1 }, { ...line, productId: '1' }), true);
});

test('an existing line gets an absolute quantity update instead of another add', () => {
  const line = { id: 'line-1', cartId: 'cart-1', productId: 'p1', variantId: 'v1', storeId: 's1', quantity: 2 };
  assert.deepEqual(planCartLineMutation([line], line, 1, 'cart-1'), {
    type: 'update', line, quantity: 3,
  });
});

test('a different store or variant is added as a separate line', () => {
  const line = { id: 'line-1', cartId: 'cart-1', productId: 'p1', variantId: 'v1', storeId: 's1', quantity: 2 };
  assert.equal(planCartLineMutation([line], { ...line, storeId: 's2' }, 1, 'cart-2').type, 'add');
  assert.equal(planCartLineMutation([line], { ...line, variantId: 'v2' }, 1, 'cart-1').type, 'add');
});

test('a guest line without a server cart ID is never sent as a server line update', () => {
  const guestLine = { id: 'p1', productId: 'p1', variantId: 'v1', storeId: 's1', quantity: 1 };
  assert.equal(planCartLineMutation([guestLine], guestLine, 1, 'cart-1').type, 'add');
});
