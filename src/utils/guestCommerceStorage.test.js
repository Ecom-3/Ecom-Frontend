import test from 'node:test';
import assert from 'node:assert/strict';
import { guestCommerceStorageKeys, readGuestList, writeGuestList } from './guestCommerceStorage.js';

const memoryStorage = () => {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
};

test('guest cart, wishlist, and saved items survive a storage reload', () => {
  const storage = memoryStorage();
  const item = { productId: 'p1', variantId: 'v1', quantity: 2 };
  for (const kind of ['cart', 'wishlist', 'saved']) writeGuestList(kind, [item], storage);
  assert.deepEqual(readGuestList('cart', storage), [item]);
  assert.deepEqual(readGuestList('wishlist', storage), [item]);
  assert.deepEqual(readGuestList('saved', storage), [item]);
});

test('empty lists remove only their namespaced guest key', () => {
  const storage = memoryStorage();
  writeGuestList('cart', [{ productId: 'p1' }], storage);
  writeGuestList('wishlist', [{ productId: 'p2' }], storage);
  writeGuestList('cart', [], storage);
  assert.deepEqual(readGuestList('cart', storage), []);
  assert.deepEqual(readGuestList('wishlist', storage), [{ productId: 'p2' }]);
  assert.equal(guestCommerceStorageKeys.cart, 'ecom.guest.cart.v1');
});

test('malformed data and unavailable storage fall back to empty in-memory lists', () => {
  const storage = memoryStorage();
  storage.setItem(guestCommerceStorageKeys.cart, '{broken');
  assert.deepEqual(readGuestList('cart', storage), []);
  assert.doesNotThrow(() => writeGuestList('cart', [{ productId: 'p1' }], {
    setItem() { throw new Error('storage disabled'); },
    removeItem() { throw new Error('storage disabled'); },
  }));
});
