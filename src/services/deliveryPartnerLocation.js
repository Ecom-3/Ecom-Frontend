import { openStreetMapEmbedUrl, openStreetMapLocationUrl } from './openStreetMapService.js';

export const deliveryPartnerLocation = (partner) => {
  const rawLatitude = partner?.deliveryLatitude;
  const rawLongitude = partner?.deliveryLongitude;
  if (rawLatitude === null || rawLatitude === undefined || String(rawLatitude).trim() === ''
      || rawLongitude === null || rawLongitude === undefined || String(rawLongitude).trim() === '') return null;
  const latitude = Number(rawLatitude);
  const longitude = Number(rawLongitude);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90
      || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) return null;
  return {
    latitude,
    longitude,
    updatedAt: partner.deliveryLocationUpdatedAt || null,
    mapUrl: openStreetMapLocationUrl({ lat: latitude, lng: longitude }),
    embedUrl: openStreetMapEmbedUrl({ lat: latitude, lng: longitude }),
  };
};
