import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { geoPointToViewport, geographicCirclePoints, projectGeoPoint, TILE_SIZE, unprojectWorldPoint } from '../../utils/geoMapProjection.js';

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

const StoreServiceAreaMap = ({ store, radiusKm, customerPoint, routePoints = [] }) => {
  const mapRef = useRef(null);
  const dragRef = useRef(null);
  const storePoint = useMemo(() => ({ latitude: Number(store.latitude), longitude: Number(store.longitude) }), [store.latitude, store.longitude]);
  const [mapSize, setMapSize] = useState({ width: 800, height: 260 });
  const [center, setCenter] = useState(storePoint);
  const radiusMeters = Number(radiusKm) > 0 ? Number(radiusKm) * 1000 : 0;
  const initialZoom = radiusMeters > 0
    ? clamp(Math.floor(Math.log2((Math.cos(storePoint.latitude * Math.PI / 180) * 40075016.686) / (256 * (radiusMeters * 2 / (260 * 0.78))))), 3, 18)
    : 13;
  const [zoom, setZoom] = useState(initialZoom);

  useEffect(() => {
    const element = mapRef.current;
    if (!element) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      setMapSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const tileRows = useMemo(() => {
    const centerWorld = projectGeoPoint(center, zoom);
    const centerTileX = Math.floor(centerWorld.x / TILE_SIZE);
    const centerTileY = Math.floor(centerWorld.y / TILE_SIZE);
    const rangeX = Math.ceil(mapSize.width / (2 * TILE_SIZE)) + 1;
    const rangeY = Math.ceil(mapSize.height / (2 * TILE_SIZE)) + 1;
    const tileCount = 2 ** zoom;
    const tiles = [];
    for (let offsetY = -rangeY; offsetY <= rangeY; offsetY += 1) {
      const y = centerTileY + offsetY;
      if (y < 0 || y >= tileCount) continue;
      for (let offsetX = -rangeX; offsetX <= rangeX; offsetX += 1) {
        const unwrappedX = centerTileX + offsetX;
        const x = ((unwrappedX % tileCount) + tileCount) % tileCount;
        tiles.push({
          key: `${zoom}/${x}/${y}`,
          src: `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`,
          left: unwrappedX * TILE_SIZE - centerWorld.x + mapSize.width / 2,
          top: y * TILE_SIZE - centerWorld.y + mapSize.height / 2,
        });
      }
    }
    return tiles;
  }, [center, mapSize.height, mapSize.width, zoom]);

  const circlePoints = useMemo(() => radiusMeters ? geographicCirclePoints(storePoint, radiusMeters) : [], [radiusMeters, storePoint]);
  const toViewport = (point) => geoPointToViewport(point, center, zoom, mapSize.width, mapSize.height);
  const storeScreenPoint = toViewport(storePoint);
  const customerScreenPoint = customerPoint ? toViewport(customerPoint) : null;
  const circlePath = circlePoints.map((point, index) => {
    const screen = toViewport(point);
    return `${index === 0 ? 'M' : 'L'} ${screen.x} ${screen.y}`;
  }).join(' ') + (circlePoints.length ? ' Z' : '');
  const routePath = routePoints.map((point, index) => {
    const screen = toViewport({ latitude: point[1], longitude: point[0] });
    return `${index === 0 ? 'M' : 'L'} ${screen.x} ${screen.y}`;
  }).join(' ');

  const handlePointerDown = (event) => {
    if (event.target.closest('button')) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, center, zoom };
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current) return;
    const drag = dragRef.current;
    const start = projectGeoPoint(drag.center, drag.zoom);
    const worldSize = TILE_SIZE * 2 ** drag.zoom;
    setCenter(unprojectWorldPoint({
      x: start.x - (event.clientX - drag.x),
      y: clamp(start.y - (event.clientY - drag.y), 0, worldSize),
    }, drag.zoom));
  };

  const endDrag = () => { dragRef.current = null; };
  const centerOnStore = () => { setCenter(storePoint); setZoom(initialZoom); };

  return <Box
    ref={mapRef}
    className="store-radius-map"
    role="region"
    aria-label={`${store.name} delivery service area map`}
    onPointerDown={handlePointerDown}
    onPointerMove={handlePointerMove}
    onPointerUp={endDrag}
    onPointerCancel={endDrag}
  >
    <Box className="store-map-tiles" aria-hidden="true">
      {tileRows.map((tile) => <img key={tile.key} src={tile.src} alt="" draggable="false" style={{ left: tile.left, top: tile.top }} />)}
    </Box>
    <svg className="store-map-geographic-overlay" viewBox={`0 0 ${mapSize.width} ${mapSize.height}`} preserveAspectRatio="none" aria-hidden="true">
      {circlePath && <path className="store-map-radius-path" d={circlePath} />}
      {routePath && <path className="store-map-route-path" d={routePath} />}
    </svg>
    {radiusMeters > 0 && <Typography className="store-map-radius-label" style={{ left: storeScreenPoint.x, top: storeScreenPoint.y }}>
      {radiusKm} km service radius
    </Typography>}
    <Box className="store-map-marker store-map-store-marker" style={{ left: storeScreenPoint.x, top: storeScreenPoint.y }}>
      <StorePin />
      <span>{store.name}</span>
    </Box>
    {customerScreenPoint && <Box className="store-map-marker store-map-customer-marker" style={{ left: customerScreenPoint.x, top: customerScreenPoint.y }}>
      <StorePin customer />
      <span>Delivery location</span>
    </Box>}
    <Box className="store-map-controls">
      <Button aria-label="Zoom in" onClick={() => setZoom((value) => clamp(value + 1, 3, 18))}><AddIcon /></Button>
      <Button aria-label="Zoom out" onClick={() => setZoom((value) => clamp(value - 1, 3, 18))}><RemoveIcon /></Button>
      <Button aria-label="Center map on store" onClick={centerOnStore}><MyLocationIcon /></Button>
    </Box>
    <Typography className="store-map-attribution"><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a></Typography>
  </Box>;
};

const StorePin = ({ customer = false }) => (
  <svg className={customer ? 'store-map-pin-icon customer' : 'store-map-pin-icon'} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 22s8-7.2 8-13a8 8 0 1 0-16 0c0 5.8 8 13 8 13Z" />
    <circle cx="12" cy="9" r="2.6" />
  </svg>
);

export default StoreServiceAreaMap;
