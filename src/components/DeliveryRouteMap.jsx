import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './DeliveryRouteMap.css';
import { validCoordinates } from '../pages/DeliveryNavigationPage/deliveryNavigation.js';

const mapPoint = (point) => validCoordinates(point?.lat ?? point?.latitude, point?.lng ?? point?.longitude);
const roundedPoint = (point) => {
  const valid = mapPoint(point);
  return valid ? `${valid.lat.toFixed(3)},${valid.lng.toFixed(3)}` : '';
};

export default function DeliveryRouteMap({ origin, destination, height = 460, className = '', onRouteMetrics }) {
  const node = useRef(null);
  const map = useRef(null);
  const layers = useRef(null);
  const from = useMemo(() => mapPoint(origin), [origin?.lat, origin?.lng, origin?.latitude, origin?.longitude]);
  const to = useMemo(() => mapPoint(destination), [destination?.lat, destination?.lng, destination?.latitude, destination?.longitude]);
  const routeKey = `${roundedPoint(from)}>${roundedPoint(to)}`;

  useEffect(() => {
    if (!node.current || map.current) return undefined;
    const instance = L.map(node.current, { scrollWheelZoom: false, zoomControl: true, attributionControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(instance);
    map.current = instance;
    layers.current = L.layerGroup().addTo(instance);
    return () => {
      instance.remove();
      map.current = null;
      layers.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !layers.current) return undefined;
    const currentMap = map.current;
    const currentLayers = layers.current;
    currentLayers.clearLayers();
    const points = [];
    const addPin = (point, kind, label, title) => {
      if (!point) return;
      const marker = L.marker([point.lat, point.lng], {
        icon: L.divIcon({
          className: `delivery-route-pin delivery-route-pin--${kind}`,
          html: `<span>${label}</span>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        }),
        title,
        keyboard: true,
      }).addTo(currentLayers);
      marker.bindTooltip(title, { direction: 'top', offset: [0, -14], opacity: 0.95 });
      points.push([point.lat, point.lng]);
    };

    addPin(from, 'partner', 'R', 'Delivery partner');
    addPin(to, 'customer', 'C', 'Customer destination');
    if (points.length > 1) {
      L.polyline(points, { color: '#0b6e4f', weight: 4, opacity: 0.72, dashArray: '8 8' }).addTo(currentLayers);
    }
    if (points.length > 1) currentMap.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 15 });
    else if (points.length === 1) currentMap.setView(points[0], 15);
    else currentMap.setView([20.5937, 78.9629], 5);
    window.setTimeout(() => currentMap.invalidateSize(), 0);
    return undefined;
  }, [routeKey]);

  useEffect(() => {
    if (!from || !to || !layers.current) { onRouteMetrics?.(null); return undefined; }
    const controller = new AbortController();
    onRouteMetrics?.(null);
    const drawRoadRoute = async () => {
      const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) return;
        const payload = await response.json();
        const coordinates = payload?.routes?.[0]?.geometry?.coordinates;
        if (!Array.isArray(coordinates) || coordinates.length < 2 || !layers.current) return;
        const route = payload.routes[0];
        onRouteMetrics?.({ distanceKm: Number(route.distance) / 1000, durationMinutes: Math.max(1, Math.ceil(Number(route.duration) / 60)) });
        L.polyline(coordinates.map(([lng, lat]) => [lat, lng]), {
          color: '#087b58', weight: 5, opacity: 0.9,
        }).addTo(layers.current);
      } catch (error) {
        if (error.name !== 'AbortError') { /* The direct map line and external directions remain available. */ }
      }
    };
    drawRoadRoute();
    return () => controller.abort();
  }, [routeKey, onRouteMetrics]);

  return <div className={`delivery-route-map ${className}`} style={{ height }} ref={node} aria-label="Map showing delivery partner and customer route" role="application" />;
}
