import test from 'node:test';
import assert from 'node:assert/strict';
import { deliveryPartnerLocation } from './deliveryPartnerLocation.js';

test('delivery partner location provides validated coordinates, map URLs, and last update', () => {
  const location = deliveryPartnerLocation({
    deliveryLatitude: '17.3850',
    deliveryLongitude: '78.4867',
    deliveryLocationUpdatedAt: '2026-10-26T10:00:00Z',
  });
  assert.equal(location.latitude, 17.385);
  assert.equal(location.longitude, 78.4867);
  assert.equal(location.updatedAt, '2026-10-26T10:00:00Z');
  assert.match(location.mapUrl, /openstreetmap\.org/);
  assert.match(location.embedUrl, /export\/embed\.html/);
});

test('missing, partial, or invalid delivery partner coordinates do not produce a map', () => {
  assert.equal(deliveryPartnerLocation(null), null);
  assert.equal(deliveryPartnerLocation({ deliveryLatitude: 17.4 }), null);
  assert.equal(deliveryPartnerLocation({ deliveryLatitude: 91, deliveryLongitude: 0 }), null);
  assert.equal(deliveryPartnerLocation({ deliveryLatitude: 0, deliveryLongitude: -181 }), null);
});
