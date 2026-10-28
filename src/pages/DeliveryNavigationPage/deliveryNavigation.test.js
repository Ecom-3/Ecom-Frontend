import test from 'node:test';
import assert from 'node:assert/strict';
import { deliveryAddressOf, distanceKm, navigationDirectionsUrl, navigationPrerequisiteMessage, readBrowserPosition, validCoordinates } from './deliveryNavigation.js';

test('coordinates reject missing, malformed, and out-of-range GPS values', () => {
  assert.deepEqual(validCoordinates('17.4', '78.4'), { lat: 17.4, lng: 78.4 });
  assert.equal(validCoordinates(91, 0), null);
  assert.equal(validCoordinates(0, -181), null);
  assert.equal(validCoordinates('', ''), null);
});

test('navigation uses only the shipping destination and includes its full address', () => {
  assert.equal(deliveryAddressOf({ addresses: [
    { addressType: 'BILLING', addressLine1: 'Billing only' },
    { addressType: 'SHIPPING', addressLine1: '12 Main Rd', city: 'Hyderabad', postalCode: '500001' },
  ] }), '12 Main Rd, Hyderabad, 500001');
  assert.equal(deliveryAddressOf({ addresses: [{ addressType: 'BILLING', addressLine1: 'Do not navigate here' }] }), '');
});

test('navigation explains missing route prerequisites without implying GPS is being requested', () => {
  assert.match(navigationPrerequisiteMessage(null, ''), /open navigation from an assigned delivery/i);
  assert.match(navigationPrerequisiteMessage({ id: 'order-1' }, ''), /address is unavailable/i);
  assert.equal(navigationPrerequisiteMessage({ id: 'order-1' }, '12 Main Road'), '');
});

test('GPS failures never substitute fabricated coordinates', async () => {
  await assert.rejects(readBrowserPosition(null), /not supported/i);
  await assert.rejects(readBrowserPosition({ getCurrentPosition: (_success, fail) => fail({ code: 1 }) }), /permission was denied/i);
  await assert.rejects(readBrowserPosition({ getCurrentPosition: (success) => success({ coords: { latitude: 91, longitude: 0 } }) }), /invalid location/i);
  assert.equal(distanceKm({ lat: 91, lng: 0 }, { lat: 0, lng: 0 }), null);
});

test('external directions require validated origin and destination and encode both', () => {
  assert.equal(navigationDirectionsUrl(null, { lat: 1, lng: 2 }), '');
  const url = navigationDirectionsUrl({ lat: 17.4, lng: 78.4 }, { lat: 17.5, lng: 78.5 });
  assert.match(url, /^https:\/\/www\.openstreetmap\.org\/directions\?/);
  assert.ok(url.includes(encodeURIComponent('17.4,78.4')));
  assert.ok(url.includes(encodeURIComponent('17.5,78.5')));
});
