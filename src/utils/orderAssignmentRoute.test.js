import test from 'node:test';
import assert from 'node:assert/strict';
import { orderAssignmentPath } from './orderAssignmentRoute.js';

test('Global Store assignment route is limited to Super Admin and Global Admin', () => {
  const global = { id: 'backend/order 1', fulfillmentType: 'global' };
  assert.equal(orderAssignmentPath(global, 'super-admin'), '/admin/orders/assign/backend%2Forder%201');
  assert.equal(orderAssignmentPath(global, 'global-admin'), '/admin/orders/assign/backend%2Forder%201');
  assert.equal(orderAssignmentPath(global, 'store-manager'), null);
});

test('physical-store orders retain their delivery-partner route', () => {
  const physical = { id: 'store-order-2', fulfillmentType: 'nearby' };
  assert.equal(orderAssignmentPath(physical, 'super-admin'), '/admin/orders/delivery/store-order-2');
  assert.equal(orderAssignmentPath(physical, 'store-manager'), '/admin/orders/delivery/store-order-2');
  assert.equal(orderAssignmentPath(physical, 'customer'), null);
});
