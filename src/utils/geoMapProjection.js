export const TILE_SIZE = 256;
export const EARTH_RADIUS_METERS = 6371008.8;
export const MAX_MERCATOR_LATITUDE = 85.05112878;

export const projectGeoPoint = ({ latitude, longitude }, zoom) => {
  const size = TILE_SIZE * 2 ** zoom;
  const lat = Math.max(-MAX_MERCATOR_LATITUDE, Math.min(MAX_MERCATOR_LATITUDE, Number(latitude)));
  const lng = Number(longitude);
  const sin = Math.sin(lat * Math.PI / 180);
  return {
    x: (lng + 180) / 360 * size,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * size,
  };
};

export const unprojectWorldPoint = ({ x, y }, zoom) => {
  const size = TILE_SIZE * 2 ** zoom;
  const longitude = x / size * 360 - 180;
  const latitude = (180 / Math.PI) * Math.atan(Math.sinh(Math.PI * (1 - 2 * y / size)));
  return { latitude, longitude };
};

export const geoPointToViewport = (point, center, zoom, width, height) => {
  const pointWorld = projectGeoPoint(point, zoom);
  const centerWorld = projectGeoPoint(center, zoom);
  const worldSize = TILE_SIZE * 2 ** zoom;
  let deltaX = pointWorld.x - centerWorld.x;
  deltaX -= Math.round(deltaX / worldSize) * worldSize;
  return { x: width / 2 + deltaX, y: height / 2 + pointWorld.y - centerWorld.y };
};

export const geographicCirclePoints = (center, radiusMeters, segments = 72) => {
  const latitude = Number(center.latitude) * Math.PI / 180;
  const longitude = Number(center.longitude) * Math.PI / 180;
  const angularDistance = Number(radiusMeters) / EARTH_RADIUS_METERS;
  return Array.from({ length: segments }, (_, index) => {
    const bearing = index * 2 * Math.PI / segments;
    const targetLatitude = Math.asin(
      Math.sin(latitude) * Math.cos(angularDistance)
      + Math.cos(latitude) * Math.sin(angularDistance) * Math.cos(bearing),
    );
    const targetLongitude = longitude + Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(latitude),
      Math.cos(angularDistance) - Math.sin(latitude) * Math.sin(targetLatitude),
    );
    return { latitude: targetLatitude * 180 / Math.PI, longitude: targetLongitude * 180 / Math.PI };
  });
};

export const metersPerPixelAt = (latitude, zoom) => (
  Math.cos(Number(latitude) * Math.PI / 180) * 2 * Math.PI * EARTH_RADIUS_METERS / (TILE_SIZE * 2 ** zoom)
);
