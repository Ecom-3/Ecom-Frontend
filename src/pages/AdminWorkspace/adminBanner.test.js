import test from 'node:test';
import assert from 'node:assert/strict';
import { toBannerPayload } from './adminBanner.js';

test('Store Manager banner payload always targets the authenticated assigned store', () => {
  const payload = toBannerPayload({ name: 'Store offer', scope: 'Global', location: 'Other', store: 'other-store' },
    { role: 'store-manager', store: 'Display name' }, 'store-1');
  assert.equal(payload.scope, 'STORE');
  assert.equal(payload.storeId, 'store-1');
  assert.equal(payload.locationId, null);
});

test('Store Manager banner payload requires an assigned store', () => {
  assert.throws(() => toBannerPayload({ name: 'Store offer' }, { role: 'store-manager' }), /No store is assigned/);
});

test('non-manager banner payload keeps configured scope behavior', () => {
  assert.equal(toBannerPayload({ name: 'Global offer' }, { role: 'global-admin' }).scope, 'GLOBAL');
});
