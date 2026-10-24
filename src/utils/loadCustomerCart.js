import { migrateGuestCart } from './migrateGuestCart.js';

// Store selection is a browsing preference, not an index of the customer's carts.
export const loadCustomerCart = async ({ customerId, readGuestItems, api, isCurrent = () => true, storage = sessionStorage, onGuestItemMigrated, persistGuestItems = true }) => {
  const errors = [];
  const storeIds = [...new Set(readGuestItems().map((item) => item.storeId).filter(Boolean))];

  for (const storeId of storeIds) {
    if (!isCurrent()) return null;
    try {
      let cart;
      try {
        cart = await api.getActiveCart({ customerId, storeId });
      } catch (error) {
        if (error.status !== 404) throw error;
        if (!isCurrent()) return null;
        cart = await api.createCart({ customerId, storeId });
      }
      if (!isCurrent()) return null;
      await migrateGuestCart(cart, readGuestItems(), api.addCartItem, storage, isCurrent, onGuestItemMigrated, persistGuestItems);
    } catch (error) {
      errors.push(error);
    }
  }

  if (!isCurrent()) return null;
  // Read after migration so acknowledged guest lines are included in server state.
  // A failed read must reject; the caller keeps the last visible cart in that case.
  const carts = await api.getActiveCarts(customerId);
  if (!isCurrent()) return null;
  if (!Array.isArray(carts)) throw new Error('Cart Service returned an invalid cart list. Please retry.');
  return { carts, guestItems: readGuestItems(), errors };
};
