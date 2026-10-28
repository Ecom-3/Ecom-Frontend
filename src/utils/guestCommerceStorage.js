const KEYS = Object.freeze({
  cart: 'ecom.guest.cart.v1',
  wishlist: 'ecom.guest.wishlist.v1',
  saved: 'ecom.guest.saved-for-later.v1',
});

const defaultStorage = () => {
  try { return globalThis.localStorage; } catch { return null; }
};

export const readGuestList = (kind, storage = defaultStorage()) => {
  const key = KEYS[kind];
  if (!key || !storage) return [];
  try {
    const value = JSON.parse(storage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

export const writeGuestList = (kind, value, storage = defaultStorage()) => {
  const key = KEYS[kind];
  if (!key || !storage) return;
  try {
    if (Array.isArray(value) && value.length) storage.setItem(key, JSON.stringify(value));
    else storage.removeItem(key);
  } catch {
    // Browser storage can be unavailable or full; guest shopping still works in memory.
  }
};

export const guestCommerceStorageKeys = KEYS;
