import { isGlobalProduct } from './storeDelivery.js';

export const validateGlobalCheckout = async (groups, lookup) => {
  const items = groups.filter(({ line = {} }) =>
    line.fulfillmentType === 'global' || line.deliveryType === 'global' || line.storeId === 'global-store',
  ).flatMap(group => group.items);
  const products = new Map();
  for (const item of items) {
    const id = item.productId || item.id;
    if (!products.has(id)) products.set(id, await lookup(id));
    if (!isGlobalProduct(products.get(id))) {
      throw new Error(`${item.productName || item.title || 'This product'} is not eligible for global delivery. Remove it from global checkout or choose an available local store.`);
    }
  }
};

export const checkoutErrorMessage = (reason) => {
  if (typeof reason?.payload?.message === 'string' && reason.payload.message.trim()) return reason.payload.message;
  if (reason?.name === 'TypeError' || Number(reason?.status) >= 500) return 'Checkout could not be completed. A service may be unavailable. Please try again shortly.';
  return reason?.message || 'Payment could not be completed.';
};
