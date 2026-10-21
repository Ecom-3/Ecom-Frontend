import test from 'node:test';
import assert from 'node:assert/strict';
import { rememberProductStore, resolveProductStore } from './productStoreResolver.js';

test('store resolution uses only store associations present on API product records', () => {
  const catalog=[{productId:'nuts',storeId:'db-store-1',storeName:'Database Store'}];
  const global={productId:'nuts',storeId:'global-store',store:'Global Store'};
  assert.equal(resolveProductStore(global,catalog).storeId,'global-store');
  assert.equal(rememberProductStore(global).store,'Global Store');
  assert.equal(resolveProductStore({ productId:'nuts' },catalog).storeId,'db-store-1');
  assert.equal(resolveProductStore({ productId:'missing' },catalog),null);
});
