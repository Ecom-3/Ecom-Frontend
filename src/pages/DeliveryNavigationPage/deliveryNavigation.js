import { openStreetMapDirectionsUrl } from '../../services/openStreetMapService.js';
import { geocodeOpenStreetMap } from '../../services/openStreetMapService.js';

export const validCoordinates = (latitude, longitude) => {
  if (latitude === null || latitude === undefined || String(latitude).trim() === ''
      || longitude === null || longitude === undefined || String(longitude).trim() === '') return null;
  const lat = Number(latitude);
  const lng = Number(longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
    ? { lat, lng }
    : null;
};

export const deliveryAddressOf = (order) => {
  const address = order?.shippingAddress
    || (order?.addresses || []).find((entry) => String(entry.addressType || '').toUpperCase() === 'SHIPPING');
  if (address) {
    const parts = [address.addressLine1, address.addressLine2, address.city, address.state, address.postalCode, address.country].filter(Boolean);
    if (parts.length) return parts.join(', ');
  }
  return String(order?.checkout?.deliveryAddress || order?.deliveryAddress || order?.address || '').trim();
};

export const customerCoordinatesOf = (order) => {
  const address = order?.shippingAddress
    || (order?.addresses || []).find((entry) => String(entry.addressType || '').toUpperCase() === 'SHIPPING');
  const candidates = [
    [order?.customerLatitude, order?.customerLongitude],
    [order?.destinationLatitude, order?.destinationLongitude],
    [address?.latitude ?? address?.lat, address?.longitude ?? address?.lng],
    [address?.coordinates?.lat, address?.coordinates?.lng],
  ];
  for (const [latitude, longitude] of candidates) {
    const point = validCoordinates(latitude, longitude);
    if (point) return point;
  }
  return null;
};

export const resolveDeliveryDestination = async (order) => {
  const saved = customerCoordinatesOf(order);
  const address = deliveryAddressOf(order);
  if (saved) return { ...saved, label: address || 'Customer delivery location', source: 'saved' };

  const shipping = order?.shippingAddress
    || (order?.addresses || []).find((entry) => String(entry.addressType || '').toUpperCase() === 'SHIPPING')
    || {};
  const areaQuery = [shipping.city, shipping.state, shipping.postalCode, shipping.country || 'India']
    .map((part) => String(part || '').trim())
    .filter((part, index, all) => part && all.findIndex((other) => other.toLowerCase() === part.toLowerCase()) === index)
    .join(', ');
  const street = String(shipping.addressLine1 || '').trim().slice(0, 100);
  const query = [street, areaQuery].filter(Boolean).join(', ') || address;
  const result = await geocodeOpenStreetMap(query);
  const point = validCoordinates(result?.lat, result?.lng);
  if (!point) return null;
  return { ...point, label: result.address || areaQuery || address, source: 'geocoded' };
};

export const navigationPrerequisiteMessage = (order, address) => {
  if (!order?.id) return 'Open navigation from an assigned delivery.';
  if (!String(address || '').trim() && !customerCoordinatesOf(order)) return 'Delivery address is unavailable, and no saved map location is available for this assignment.';
  return '';
};

export const readBrowserPosition = (geolocation = globalThis.navigator?.geolocation) => new Promise((resolve, reject) => {
  if (!geolocation?.getCurrentPosition) {
    reject(new Error('Location is not supported by this browser.'));
    return;
  }
  geolocation.getCurrentPosition(({ coords }) => {
    const position = validCoordinates(coords?.latitude, coords?.longitude);
    if (!position) {
      reject(new Error('The browser returned an invalid location.'));
      return;
    }
    resolve(position);
  }, (error) => {
    const reasons = {
      1: 'Location permission was denied. Allow location access and try again.',
      2: 'Your current location is unavailable. Try again when GPS is available.',
      3: 'Location lookup timed out. Try again.',
    };
    reject(new Error(reasons[error?.code] || error?.message || 'Could not read your current location.'));
  }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 });
});

export const navigationDirectionsUrl = (origin, destination) => {
  const from = validCoordinates(origin?.lat, origin?.lng);
  const to = validCoordinates(destination?.lat, destination?.lng);
  if (!from || !to) return '';
  return openStreetMapDirectionsUrl({ origin: `${from.lat},${from.lng}`, destination: `${to.lat},${to.lng}` });
};

export const distanceKm = (a, b) => {
  const from = validCoordinates(a?.lat, a?.lng);
  const to = validCoordinates(b?.lat, b?.lng);
  if (!from || !to) return null;
  const radians = (value) => value * Math.PI / 180;
  const dLat = radians(to.lat - from.lat);
  const dLng = radians(to.lng - from.lng);
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(radians(from.lat)) * Math.cos(radians(to.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
};
