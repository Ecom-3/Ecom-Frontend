import test from 'node:test';
import assert from 'node:assert/strict';
import { isCustomerSession, resolveCustomerId } from './customerSession.js';

test('customer role can use the account ID when local auth has no customer token claim', () => {
  assert.equal(isCustomerSession({ role: 'customer' }), true);
  assert.equal(resolveCustomerId({ role: 'customer', userId: 'local-customer-1' }), 'local-customer-1');
});

test('customer token claim identifies the customer even when role is omitted', () => {
  assert.equal(resolveCustomerId({ tokenCustomerId: 'customer-1', userId: 'other-id' }), 'customer-1');
});

test('staff account IDs are never used for customer cart or order requests', () => {
  for (const role of ['super-admin', 'global-admin', 'location-admin', 'store-manager', 'delivery-partner']) {
    assert.equal(isCustomerSession({ role }), false);
    assert.equal(resolveCustomerId({ role, userId: 'staff-2' }), null);
  }
});
