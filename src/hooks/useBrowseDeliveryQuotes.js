import { useEffect, useState } from 'react';
import { getCachedStoreDeliveryQuote } from '../services/catalogApi';

// Resolve the same cached quotes used by cards before delivery filters hide cards.
export const useBrowseDeliveryQuotes = (products, location, addresses = []) => {
  const address = addresses.find(item => item.isDefault) || addresses[0] || {};
  const latitude = location?.latitude ?? address.coordinates?.lat ?? address.latitude;
  const longitude = location?.longitude ?? address.coordinates?.lng ?? address.longitude;
  const storeIds = JSON.stringify([...new Set(products.filter(item => item.fulfillmentType !== 'global').map(item => item.storeId).filter(Boolean))].sort());
  const scope = JSON.stringify([storeIds, latitude, longitude]);
  const [result, setResult] = useState(null);
  useEffect(() => {
    if (latitude == null || longitude == null || latitude === '' || longitude === '' || !Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) return;
    let ignore = false;
    for (const storeId of JSON.parse(storeIds)) {
      getCachedStoreDeliveryQuote(storeId, { latitude: Number(latitude), longitude: Number(longitude) })
        .then(quote => {
          if (!ignore) setResult(previous => ({ scope, quotes: { ...(previous?.scope === scope ? previous.quotes : {}), [storeId]: quote } }));
        }).catch(() => {}); // The card and filters both retain the supplied store ETA.
    }
    return () => { ignore = true; };
  }, [storeIds, latitude, longitude, scope]);
  return products.map(product => ({ ...product, deliveryQuote: result?.scope === scope ? result.quotes[product.storeId] || product.deliveryQuote : product.deliveryQuote }));
};
