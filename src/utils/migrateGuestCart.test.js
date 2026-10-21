import test from 'node:test';
import assert from 'node:assert/strict';
import { migrateGuestCart } from './migrateGuestCart.js';

const cart = { id: 'cart', customerId: 'customer', storeId: 'store', items: [] };
const items = [
  { productId: 'a', variantId: 'variant', storeId: 'store', title: 'A', price: 12, quantity: 2 },
  { productId: 'b', variantId: null, storeId: 'store', title: 'B', price: 5, quantity: 1 },
  { productId: 'c', storeId: 'other', title: 'C', price: 9, quantity: 3 },
];
const memory = () => {
  const data = new Map([['guestCartItems', JSON.stringify(items)]]);
  return { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) };
};

test('migration preserves variant, quantity and price and leaves other stores saved', async () => {
  const storage = memory();
  const sent = [];
  const result = await migrateGuestCart(cart, items, async (id, body) => {
    assert.equal(id, cart.id);
    sent.push(body);
    return { ...cart, items: [...sent] };
  }, storage);
  assert.deepEqual(sent, [
    { productId: 'a', variantId: 'variant', productName: 'A', quantity: 2, unitPrice: 12 },
    { productId: 'b', variantId: null, productName: 'B', quantity: 1, unitPrice: 5 },
  ]);
  assert.equal(result.items.length, 2);
  assert.deepEqual(JSON.parse(storage.getItem('guestCartItems')), [items[2]]);
});

test('partial migration retains only unacknowledged guest lines and reuses keys on retry', async () => {
  const storage = memory();
  const originalKeys = new Map();
  let fail = true;
  const add = async (_id, body, key) => {
    if (originalKeys.has(body.productId)) assert.equal(key, originalKeys.get(body.productId));
    originalKeys.set(body.productId, key);
    if (body.productId === 'b' && fail) throw new Error('Lost response');
    return cart;
  };
  await assert.rejects(migrateGuestCart(cart, items, add, storage), /Lost response/);
  assert.deepEqual(JSON.parse(storage.getItem('guestCartItems')), [items[1], items[2]]);
  fail = false;
  await migrateGuestCart(cart, JSON.parse(storage.getItem('guestCartItems')), add, storage);
  assert.equal(originalKeys.size, 2);
  assert.deepEqual(JSON.parse(storage.getItem('guestCartItems')), [items[2]]);
});

test('an unrelated store makes no requests and does not clear saved items', async () => {
  const storage = memory();
  const other = { ...cart, storeId: 'unrelated' };
  assert.equal(await migrateGuestCart(other, items, () => assert.fail('Unexpected request'), storage), other);
  assert.deepEqual(JSON.parse(storage.getItem('guestCartItems')), items);
});

test('sequential store migrations preserve and then clear each store guest lines', async () => {
  const storage = memory();
  const stores = ['store', 'other'];
  const sent = [];
  for (const storeId of stores) {
    const currentItems = JSON.parse(storage.getItem('guestCartItems'));
    await migrateGuestCart({ ...cart, id: `cart-${storeId}`, storeId }, currentItems, async (_id, body) => {
      sent.push(body.productId);
      return { ...cart, storeId };
    }, storage);
  }
  assert.deepEqual(sent, ['a', 'b', 'c']);
  assert.deepEqual(JSON.parse(storage.getItem('guestCartItems')), []);
});
