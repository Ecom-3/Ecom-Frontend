import { logCartDiagnostic, logCartSnapshot } from './cartDiagnostics.js';

// Keep retry identities until all guest lines have been acknowledged by the server.
export const migrateGuestCart = async (cart, items, addItem, storage = localStorage, isCurrent = () => true) => {
  const pending = items.filter(item => item.storeId === cart.storeId && item.quantity > 0);
  if (!pending.length) return cart;
  logCartSnapshot('guest.migration.before', pending, 'guest localStorage');
  const slot = `guest-cart-migration:${cart.customerId}:${cart.id}`;
  const keys = JSON.parse(storage.getItem(slot) || '{}');
  const remaining = [...items];
  let updated = cart;
  for (const item of pending) {
    if (!isCurrent()) return updated;
    const body = {
      productId: item.productId, variantId: item.variantId ?? null,
      productName: item.productName || item.title, quantity: item.quantity,
      unitPrice: item.unitPrice ?? item.price,
    };
    const identity = JSON.stringify(body);
    keys[identity] ||= crypto.randomUUID();
    storage.setItem(slot, JSON.stringify(keys));
    logCartDiagnostic('guest.migration.add', {
      storeId: cart.storeId,
      productId: body.productId,
      variantId: body.variantId,
      quantity: body.quantity,
      source: 'guest localStorage',
      idempotencyId: keys[identity],
    });
    try {
      updated = await addItem(cart.id, body, keys[identity]);
    } catch (error) {
      logCartDiagnostic('guest.migration.failed', {
        storeId: cart.storeId,
        productId: body.productId,
        variantId: body.variantId,
        quantity: body.quantity,
        source: 'guest localStorage',
        idempotencyId: keys[identity],
      });
      throw error;
    }
    // Preserve unacknowledged lines on failure without displaying successful
    // additions twice when the complete server cart is fetched afterward.
    remaining.splice(remaining.indexOf(item), 1);
    storage.setItem('guestCartItems', JSON.stringify(remaining));
  }
  logCartSnapshot('guest.migration.after', remaining, 'guest localStorage');
  storage.removeItem(slot);
  return updated;
};
