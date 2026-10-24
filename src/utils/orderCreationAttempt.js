import { createUuid } from './uuid.js';

export const createOrderAttempt = async (data, send, storage = sessionStorage) => {
  const slot = `order-attempt:${data.customerId}:${data.storeId}`;
  const saved = JSON.parse(storage.getItem(slot) || 'null');
  // Checkout may regenerate its synthetic cart UUID after a lost response.
  // Preserve the original request while its outcome remains unresolved.
  const body = JSON.stringify(saved ? { ...data, cartId: JSON.parse(saved.body).cartId } : data);
  if (saved && saved.body !== body) {
    throw new Error('An earlier checkout has an unresolved result. Retry that checkout before changing the order.');
  }
  const attempt = saved || { body, key: createUuid() };
  // Persist before sending: a lost response or page reload must reuse the key.
  storage.setItem(slot, JSON.stringify(attempt));
  let result;
  try { result = await send(body, attempt.key); }
  catch (error) {
    if ([400, 401, 403, 422].includes(error.status)) storage.removeItem(slot);
    throw error;
  }
  storage.removeItem(slot);
  return result;
};

export const retrySavedOrderAttempt = async (customerId, storeId, send, storage = sessionStorage) => {
  const slot = `order-attempt:${customerId}:${storeId}`;
  const saved = JSON.parse(storage.getItem(slot) || 'null');
  if (!saved?.body || !saved?.key) throw new Error('There is no saved order attempt to retry.');

  const request = JSON.parse(saved.body);
  if (request.customerId !== customerId || request.storeId !== storeId) {
    throw new Error('The saved checkout does not match the current customer and store.');
  }

  let result;
  try { result = await send(saved.body, saved.key); }
  catch (error) {
    if ([400, 401, 403, 422].includes(error.status)) storage.removeItem(slot);
    throw error;
  }
  storage.removeItem(slot);
  return result;
};
