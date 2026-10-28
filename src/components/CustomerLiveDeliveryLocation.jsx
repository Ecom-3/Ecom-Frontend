import { useEffect, useState } from 'react';
import { Alert, Box, Chip, CircularProgress, Link, Typography } from '@mui/material';
import MyLocationOutlinedIcon from '@mui/icons-material/MyLocationOutlined';
import { getCustomerDeliveryLocation } from '../services/deliveryPartnerApi.js';
import { openStreetMapDirectionsUrl, reverseGeocodeOpenStreetMap } from '../services/openStreetMapService.js';
import DeliveryRouteMap from './DeliveryRouteMap.jsx';
import { deliveryAddressOf, resolveDeliveryDestination, validCoordinates } from '../pages/DeliveryNavigationPage/deliveryNavigation.js';

const LIVE_STATES = new Set(['IN_TRANSIT', 'OUT_FOR_DELIVERY']);
const prettyTime = (value) => { const date = new Date(value); return value && !Number.isNaN(date.getTime()) ? date.toLocaleString() : 'Time unavailable'; };

export default function CustomerLiveDeliveryLocation({ order, orderId, shipment }) {
  const [locationState, setLocationState] = useState(null);
  const [placeNameState, setPlaceNameState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationErrorState, setLocationErrorState] = useState(null);
  const [destinationState, setDestinationState] = useState(null);
  const address = deliveryAddressOf(order);
  const active = LIVE_STATES.has(String(shipment?.status || '').toUpperCase().replace(/\s+/g, '_'));
  const location = locationState?.orderId === orderId ? locationState.value : null;
  const placeName = placeNameState?.orderId === orderId ? placeNameState.value : '';
  const locationError = locationErrorState?.orderId === orderId ? locationErrorState.value : '';
  const destination = destinationState?.orderId === order?.id ? destinationState.value : null;
  const destinationError = destinationState?.orderId === order?.id ? destinationState.error : '';

  useEffect(() => {
    let cancelled = false;
    if (!order?.id) return undefined;
    resolveDeliveryDestination(order).then((point) => {
      if (cancelled) return;
      setDestinationState({ orderId: order.id, value: point, error: point ? '' : 'Customer map location is not available for this order.' });
    }).catch(() => {
      if (!cancelled) setDestinationState({ orderId: order.id, value: null, error: 'Could not load the customer map location.' });
    });
    return () => { cancelled = true; };
  }, [order, address]);

  useEffect(() => {
    if (!orderId || !active || !shipment?.deliveryPartnerId) return undefined;
    let cancelled = false;
    let lastCoordinates = '';
    const load = async () => {
      if (cancelled) return;
      setLoading(true);
      try {
        const payload = await getCustomerDeliveryLocation(orderId);
        if (cancelled) return;
        setLocationErrorState({ orderId, value: '' });
        const coords = payload?.available ? validCoordinates(payload.latitude, payload.longitude) : null;
        if (!coords) { setLocationState({ orderId, value: null }); setPlaceNameState({ orderId, value: '' }); return; }
        const updatedAt = payload.updatedAt || null;
        const ageMs = updatedAt ? Date.now() - new Date(updatedAt).getTime() : Infinity;
        setLocationState({ orderId, value: { ...coords, updatedAt, fresh: ageMs >= 0 && ageMs <= 120000 } });
        const key = `${coords.lat.toFixed(3)}:${coords.lng.toFixed(3)}`;
        if (key !== lastCoordinates) {
          lastCoordinates = key;
          reverseGeocodeOpenStreetMap(coords.lat, coords.lng)
            .then((place) => { if (!cancelled && place) setPlaceNameState({ orderId, value: [place.title, place.city, place.state].filter(Boolean).join(', ') || place.address || 'Current GPS position' }); })
            .catch(() => { if (!cancelled) setPlaceNameState({ orderId, value: 'Current GPS position' }); });
        }
      } catch (error) { if (!cancelled) { setLocationState({ orderId, value: null }); setLocationErrorState({ orderId, value: error.message || 'Live delivery location is temporarily unavailable.' }); } }
      finally { if (!cancelled) setLoading(false); }
    };
    load();
    const timer = window.setInterval(load, 10000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [active, orderId, shipment?.deliveryPartnerId]);

  if (!active || !shipment?.deliveryPartnerId) return null;
  const fresh = Boolean(location?.fresh);
  const directions = fresh && location && destination
    ? openStreetMapDirectionsUrl({ origin: `${location.lat},${location.lng}`, destination: `${destination.lat},${destination.lng}` })
    : '';

  return <Box component="section" aria-label="Delivery partner live location" sx={{ display: 'grid', gap: 1.25, bgcolor: '#fff', border: '1px solid #dfe8e3', borderRadius: 2, p: 2.5 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      <MyLocationOutlinedIcon sx={{ color: '#087454' }} />
      <Typography component="h2" variant="h6" fontWeight={800}>Live delivery map</Typography>
      <Chip size="small" color={fresh ? 'success' : 'default'} label={fresh ? 'Partner live' : 'Waiting for partner location'} />
      {loading && <CircularProgress size={16} aria-label="Updating delivery location" />}
    </Box>
    {location && <>
      <Typography fontWeight={700}>{placeName || 'Delivery partner current position'}</Typography>
      <Typography variant="body2" color="text.secondary">{location.lat.toFixed(5)}, {location.lng.toFixed(5)} · Updated {prettyTime(location.updatedAt)}</Typography>
    </>}
    {(destination || fresh) && <>
      <Box className="tracking-map-legend"><span><i className="tracking-partner-dot" /> Delivery partner</span><span><i className="tracking-customer-dot" /> Your delivery address</span></Box>
      <Box sx={{ height: { xs: 250, md: 380 }, overflow: 'hidden', borderRadius: 1.5, border: '1px solid #dbe7e1' }}>
        <DeliveryRouteMap origin={fresh ? location : null} destination={destination} height="100%" />
      </Box>
    </>}
    {locationError && <Alert severity="warning">{locationError}</Alert>}
    {!destination && <Alert severity="info">{destinationError || 'Loading the customer map location…'} {address && <span>Address: {address}</span>}</Alert>}
    {destination && <Typography variant="body2" color="text.secondary"><strong>Delivering to:</strong> {address || destination.label}</Typography>}
    {destination?.source === 'geocoded' && <Alert severity="info">This map pin is an approximate match because the order has no saved customer coordinates.</Alert>}
    {location && !fresh && <Alert severity="info">The partner’s last location is older than two minutes. The live route will return when a fresh GPS update arrives.</Alert>}
    {!fresh && !location && <Typography variant="body2" color="text.secondary">The live route appears when the delivery partner shares a recent GPS location.</Typography>}
    {fresh && directions && <Link href={directions} target="_blank" rel="noopener noreferrer" sx={{ justifySelf: 'start' }}>Open route directions</Link>}
  </Box>;
}
