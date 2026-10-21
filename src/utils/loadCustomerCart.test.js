import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCustomerCart } from './loadCustomerCart.js';

const item = (storeId, productId) => ({ storeId, productId, productName: productId, quantity: 1, unitPrice: 10 });
const cart = (storeId, items = []) => ({ id: `cart-${storeId}`, customerId: 'customer', storeId, status: 'ACTIVE', items });
const fixture = (guests = [], savedCarts = []) => {
  const values = new Map([['guestCartItems', JSON.stringify(guests)]]);
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  const readGuestItems = () => JSON.parse(storage.getItem('guestCartItems'));
  const saved = new Map(savedCarts.map(value => [value.storeId, structuredClone(value)]));
  const requests = [];
  const api = {
    getActiveCart: async ({ storeId }) => {
      requests.push(['store', storeId]);
      if (!saved.has(storeId)) throw Object.assign(new Error('Not found'), { status: 404 });
      return structuredClone(saved.get(storeId));
    },
    createCart: async ({ storeId }) => { saved.set(storeId, cart(storeId)); return structuredClone(saved.get(storeId)); },
    addCartItem: async (cartId, body) => {
      const current = [...saved.values()].find(value => value.id === cartId);
      current.items.push({ ...body, id: `line-${body.productId}` });
      return structuredClone(current);
    },
    getActiveCarts: async (customerId) => {
      requests.push(['customer', customerId]);
      return structuredClone([...saved.values()]);
    },
  };
  return { customerId: 'customer', storage, readGuestItems, api, requests };
};

test('refresh loads every store cart with no guest items and no selected store', async () => {
  const input = fixture([], [cart('A', [item('A', 'one')]), cart('B', [item('B', 'two')])]);
  const result = await loadCustomerCart(input);
  assert.deepEqual(result.carts.map(value => value.id), ['cart-A', 'cart-B']);
  assert.deepEqual(result.carts.flatMap(value => value.items).map(value => value.productId), ['one', 'two']);
  assert.deepEqual(input.requests, [['customer', 'customer']]);
});

test('an unrelated selected browsing store cannot hide the saved cart', async () => {
  const input = fixture([], [cart('A', [item('A', 'one')])]);
  input.storage.setItem('selectedStoreId', 'unrelated');
  input.storage.setItem('selectedStore', 'Unrelated store');
  const result = await loadCustomerCart(input);
  assert.equal(result.carts[0].storeId, 'A');
  assert.deepEqual(input.requests, [['customer', 'customer']]);
});

test('guest items from multiple stores survive the next refresh after migration', async () => {
  const input = fixture([item('A', 'one'), item('B', 'two')], [cart('C', [item('C', 'existing')])]);
  const login = await loadCustomerCart(input);
  assert.deepEqual(login.guestItems, []);
  assert.equal(login.carts.length, 3);
  input.requests.length = 0;
  const refresh = await loadCustomerCart(input);
  assert.deepEqual(refresh.carts, login.carts);
  assert.deepEqual(input.requests, [['customer', 'customer']]);
});

test('partial migration displays acknowledged server items once and retains unsynced guest items', async () => {
  const input = fixture([item('A', 'one'), item('A', 'failed'), item('B', 'two')]);
  const add = input.api.addCartItem;
  input.api.addCartItem = async (id, body) => {
    if (body.productId === 'failed') throw new Error('Cart write unavailable');
    return add(id, body);
  };
  const result = await loadCustomerCart(input);
  assert.deepEqual(result.carts.flatMap(value => value.items).map(value => value.productId), ['one', 'two']);
  assert.deepEqual(result.guestItems.map(value => value.productId), ['failed']);
  assert.equal(result.errors[0].message, 'Cart write unavailable');
});

test('a failed customer-cart read rejects instead of reporting an empty cart', async () => {
  const input = fixture();
  input.api.getActiveCarts = async () => { throw new Error('Cart read unavailable'); };
  await assert.rejects(loadCustomerCart(input), /Cart read unavailable/);
});

test('an invalid customer-cart response cannot clear the displayed cart', async () => {
  const input = fixture();
  input.api.getActiveCarts = async () => null;
  await assert.rejects(loadCustomerCart(input), /invalid cart list/);
});

test('a customer with no active carts gets a successful empty result', async () => {
  const result = await loadCustomerCart(fixture());
  assert.deepEqual(result, { carts: [], guestItems: [], errors: [] });
});

test('a response arriving after the account changes is discarded', async () => {
  const input = fixture([], [cart('A', [item('A', 'one')])]);
  let current = true;
  const read = input.api.getActiveCarts;
  input.api.getActiveCarts = async (id) => { current = false; return read(id); };
  assert.equal(await loadCustomerCart({ ...input, isCurrent: () => current }), null);
});

test('account changes stop further guest writes while retaining the in-flight acknowledgement', async () => {
  const input = fixture([item('A', 'one'), item('A', 'two')]);
  let current = true;
  const add = input.api.addCartItem;
  input.api.addCartItem = async (id, body) => { current = false; return add(id, body); };
  assert.equal(await loadCustomerCart({ ...input, isCurrent: () => current }), null);
  assert.deepEqual(input.readGuestItems().map(value => value.productId), ['two']);
  assert.ok(input.requests.every(([kind]) => kind !== 'customer'));
});
