import test from 'node:test';
import assert from 'node:assert/strict';
import { createServiceProxy, serviceBaseUrl, serviceRoutes } from './serviceRoutes.js';

const gatewayPrefixes = {
  orgAccess: '/org-access',
  customerProfile: '/customer-profile',
  catalog: '/catalog-service',
  inventory: '/inventory-service',
  payment: '/payment-service',
  alerts: '/alerts-service',
  notification: '/notification-service',
  order: '/order-api',
  cart: '/cart-api',
  fulfillment: '/fulfillment',
};

test('every client default matches a gateway route and forwards without rewriting', () => {
  const proxy = createServiceProxy('http://localhost:8082');
  assert.deepEqual(Object.keys(serviceRoutes).sort(), Object.keys(gatewayPrefixes).sort());
  for (const [service, prefix] of Object.entries(gatewayPrefixes)) {
    assert.equal(serviceBaseUrl(service), prefix);
    assert.deepEqual(proxy[prefix], { target: 'http://localhost:8082', changeOrigin: true });
  }
});

test('all services honor gateway URLs and service overrides with normalized trailing slashes', () => {
  for (const [service, prefix] of Object.entries(gatewayPrefixes)) {
    assert.equal(serviceBaseUrl(service, { VITE_API_BASE_URL: 'http://localhost:8082///' }), `http://localhost:8082${prefix}`);
    const override = serviceRoutes[service].override;
    for (const value of ['/custom///', 'https://service.example/custom///']) {
      assert.equal(serviceBaseUrl(service, {
        VITE_API_BASE_URL: 'https://gateway.example',
        [override]: value,
      }), value.replace(/\/+$/, ''));
    }
    assert.equal(serviceBaseUrl(service, { VITE_API_BASE_URL: '', [override]: '' }), prefix);
  }
});

test('unknown services fail instead of generating an incorrect request URL', () => {
  assert.throws(() => serviceBaseUrl('missing'), /Unknown backend service/);
});
