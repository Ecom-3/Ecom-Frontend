import test from 'node:test';
import assert from 'node:assert/strict';
import { geoPointToViewport, geographicCirclePoints, metersPerPixelAt, projectGeoPoint, unprojectWorldPoint } from './geoMapProjection.js';

const distanceMeters = (a, b) => {
  const radians = (degrees) => degrees * Math.PI / 180;
  const lat1 = radians(a.latitude);
  const lat2 = radians(b.latitude);
  const deltaLat = lat2 - lat1;
  const deltaLng = radians(b.longitude - a.longitude);
  const haversine = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  return 2 * 6371008.8 * Math.asin(Math.sqrt(haversine));
};

test('Web Mercator projection round trips real geographic coordinates', () => {
  const point = { latitude: 24.6, longitude: 74.2 };
  const restored = unprojectWorldPoint(projectGeoPoint(point, 13), 13);
  assert.ok(Math.abs(restored.latitude - point.latitude) < 1e-8);
  assert.ok(Math.abs(restored.longitude - point.longitude) < 1e-8);
});

test('service boundary stays a fixed geographic radius at every zoom', () => {
  const store = { latitude: 24.6, longitude: 74.2 };
  const radiusMeters = 5200;
  const points = geographicCirclePoints(store, radiusMeters);
  assert.equal(points.length, 72);
  points.forEach((point) => assert.ok(Math.abs(distanceMeters(store, point) - radiusMeters) < 0.01));
  assert.ok(Math.abs(metersPerPixelAt(store.latitude, 14) - metersPerPixelAt(store.latitude, 15) * 2) < 1e-8);
});

test('panning changes the store screen position without changing its geographic anchor', () => {
  const store = { latitude: 24.6, longitude: 74.2 };
  const original = geoPointToViewport(store, store, 13, 800, 300);
  const panned = geoPointToViewport(store, { latitude: 19.1, longitude: 72.9 }, 13, 800, 300);
  assert.deepEqual(original, { x: 400, y: 150 });
  assert.ok(panned.x < 0 || panned.x > 800 || panned.y < 0 || panned.y > 300);
});
