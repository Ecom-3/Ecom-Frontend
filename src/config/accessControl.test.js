import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccessModule, MANAGEABLE_ROLES, ROLE_HIERARCHY, ROLE_MODULES, scopeRecords, STAFF_FORM_ROLES } from './accessControl.js';

test('Super Admin manages independent admin branches and can provision Store Managers', () => {
  assert.deepEqual(ROLE_HIERARCHY['super-admin'], ['global-admin', 'location-admin']);
  assert.equal(ROLE_HIERARCHY['global-admin'], undefined);
  assert.deepEqual(MANAGEABLE_ROLES['super-admin'], ['global-admin', 'location-admin', 'store-manager']);
  assert.equal(MANAGEABLE_ROLES['global-admin'], undefined);
});

test('staff account management is available only to Super Admin and scoped Location Admin', () => {
  assert.equal(canAccessModule('super-admin', 'users'), true);
  assert.equal(canAccessModule('global-admin', 'users'), false);
  assert.equal(canAccessModule('location-admin', 'users'), true);
});

test('Global Admin navigation omits store and staff management while retaining authorized modules', () => {
  for (const module of ['stores', 'locations', 'users', 'security']) {
    assert.equal(canAccessModule('global-admin', module), false, `${module} must be hidden from Global Admin`);
  }
  for (const module of ['dashboard', 'products', 'banners', 'inventory', 'orders', 'payments', 'customers', 'reviews', 'coupons', 'notifications', 'reports', 'audit-logs']) {
    assert.equal(canAccessModule('global-admin', module), true, `${module} must remain available to Global Admin`);
  }
  assert.equal(canAccessModule('global-admin', 'delivery'), false, 'operational Delivery Partner management belongs to the Location Admin branch');
  assert.equal(canAccessModule('super-admin', 'stores'), true);
  assert.equal(canAccessModule('super-admin', 'locations'), true);
  assert.equal(canAccessModule('super-admin', 'users'), true);
  assert.equal(canAccessModule('location-admin', 'stores'), true);
  assert.equal(canAccessModule('store-manager', 'stores'), true);
  assert.ok(ROLE_MODULES['location-admin'].includes('delivery'));
  assert.ok(ROLE_MODULES['store-manager'].includes('products'));
});

test('only Super Admin and scoped Location Admin can open operational Delivery Partner management', () => {
  assert.equal(canAccessModule('super-admin', 'delivery'), true);
  assert.equal(canAccessModule('global-admin', 'delivery'), false);
  assert.equal(canAccessModule('location-admin', 'delivery'), true);
});

test('Location Admin has the configured scoped Store Manager management module', () => {
  assert.equal(canAccessModule('location-admin', 'users'), true);
  assert.deepEqual(MANAGEABLE_ROLES['location-admin'], ['store-manager', 'delivery-partner']);
  assert.deepEqual(STAFF_FORM_ROLES['location-admin'], ['store-manager']);
  assert.deepEqual(STAFF_FORM_ROLES['super-admin'], ['global-admin', 'location-admin', 'store-manager']);
  assert.equal(canAccessModule('store-manager', 'users'), false);
  assert.equal(canAccessModule('global-admin', 'users'), false);
});

test('location admin order scope matches location and store names case-insensitively', () => {
  const stores = [
    { id: 'hyd-store', name: 'Hyderabad Main', location: 'Hyderabad' },
    { id: 'chn-store', name: 'Chennai Main', location: 'Chennai' },
  ];
  const user = { role: 'location-admin', location: 'hyderabad' };
  const rows = [
    { id: 'same-location', storeId: 'hyd-store', location: 'HYDERABAD', items: [{ id: 'item-1', storeId: 'hyd-store' }] },
    { id: 'cross-location', storeId: 'chn-store', location: 'Hyderabad', items: [{ id: 'item-2', storeId: 'chn-store' }] },
    { id: 'missing-store', location: 'HYDERABAD', items: [{ id: 'item-3' }] },
  ];

  assert.deepEqual(scopeRecords(rows, user, stores), [rows[0], rows[2]]);
});

test('location admin product access is limited to products mapped to assigned stores', () => {
  const stores = [{ id: 'hyd-store', name: 'Hyderabad Main', location: 'Hyderabad' }];
  const products = [
    { id: 'mapped', storeId: 'hyd-store' },
    { id: 'other-location', storeId: 'chn-store' },
  ];

  assert.deepEqual(scopeRecords(products, { role: 'location-admin', location: 'hyderabad' }, stores, products), [products[0]]);
});

test('Global Admin record lists keep global catalog and promotion data out of location-owned rows', () => {
  const user = { role: 'global-admin' };
  const products = [
    { id: 'global', globalProduct: true, fulfillmentType: 'global' },
    { id: 'hyderabad', globalProduct: false, ownerLocation: 'hyderabad' },
  ];
  const banners = [
    { id: 'global-banner', scope: 'GLOBAL' },
    { id: 'store-banner', scope: 'STORE', storeId: 'store-hyd' },
  ];
  const coupons = [
    { id: 'global-coupon', scope: 'GLOBAL' },
    { id: 'location-coupon', scope: 'STORE', storeId: 'store-hyd' },
  ];
  const inventory = [
    { id: 'global-stock', storeId: 'global-store' },
    { id: 'local-stock', storeId: 'store-hyd' },
  ];
  const orders = [
    { id: 'global-order', fulfillmentType: 'global', items: [{}] },
    { id: 'local-order', fulfillmentType: 'store', storeId: 'store-hyd', items: [{}] },
  ];
  const staff = [{ id: 'manager', role: 'store-manager', location: 'hyderabad' }];
  const stores = [{ id: 'store-hyd', location: 'hyderabad' }];

  assert.deepEqual(scopeRecords(products, user), [products[0]]);
  assert.deepEqual(scopeRecords(banners, user), [banners[0]]);
  assert.deepEqual(scopeRecords(coupons, user), [coupons[0]]);
  assert.deepEqual(scopeRecords(inventory, user), [inventory[0]]);
  assert.deepEqual(scopeRecords(orders, user), [orders[0]]);
  assert.deepEqual(scopeRecords(staff, user), []);
  assert.deepEqual(scopeRecords(stores, user), []);
});
