import test from 'node:test';
import assert from 'node:assert/strict';
import { toCouponPayload } from './adminCoupon.js';

const baseForm = { name: 'hyd-promo', couponName: 'Hyderabad promo', discountType: 'Fixed', discount: '10', usageLimit: '5' };

test('Location Admin coupon scope follows the selected store and assigned location', () => {
  const payload = toCouponPayload({ ...baseForm, targetStore: 'hyd-store-1' }, { role: 'location-admin', location: 'Hyderabad' });
  assert.equal(payload.scope, 'STORE');
  assert.equal(payload.location, 'Hyderabad');
  assert.equal(payload.store, 'hyd-store-1');
});

test('Location Admin coupon without a target store applies at location scope', () => {
  const payload = toCouponPayload(baseForm, { role: 'location-admin', location: 'Hyderabad' });
  assert.equal(payload.scope, 'LOCATION');
  assert.equal(payload.location, 'Hyderabad');
  assert.equal(payload.store, null);
});

test('Global Admin coupon scope behavior remains unchanged', () => {
  const payload = toCouponPayload({ ...baseForm, scope: 'Store', store: 'hyd-store-1' }, { role: 'global-admin' });
  assert.equal(payload.scope, 'GLOBAL');
  assert.equal(payload.store, null);
});

test('Store Manager coupon payload derives assigned store and omits client location scope', () => {
  const payload = toCouponPayload({ ...baseForm, scope: 'Global', store: 'other-store' },
    { role: 'store-manager', store: 'Display name', location: 'Untrusted location' }, 'store-1');
  assert.equal(payload.scope, 'STORE');
  assert.equal(payload.store, 'store-1');
  assert.equal(payload.location, null);
});

test('Store Manager coupon payload requires an assigned store', () => {
  assert.throws(() => toCouponPayload(baseForm, { role: 'store-manager' }), /store/i);
});
