const isDevelopment = typeof import.meta.env !== 'undefined' && import.meta.env.DEV;

const lineFields = (item = {}, source = '') => ({
  storeId: item.storeId == null ? undefined : String(item.storeId),
  productId: item.productId == null ? undefined : String(item.productId),
  variantId: item.variantId == null ? null : String(item.variantId),
  cartItemId: (item.cartItemId ?? (source === 'server API' || item.cartId ? item.id : undefined)) == null
    ? undefined
    : String(item.cartItemId ?? item.id),
  quantity: Number.isFinite(Number(item.quantity)) ? Number(item.quantity) : undefined,
});

const allowedFields = [
  'storeId', 'productId', 'variantId', 'cartItemId', 'quantity',
  'source', 'method', 'endpoint', 'idempotencyId', 'correlationId',
];

export const createCartDiagnosticId = () => {
  if (!isDevelopment) return undefined;
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const logCartDiagnostic = (action, fields = {}) => {
  if (!isDevelopment || typeof console === 'undefined') return;
  const record = { action, timestamp: new Date().toISOString() };
  allowedFields.forEach((key) => {
    if (fields[key] !== undefined) record[key] = fields[key];
  });
  if (Array.isArray(fields.items)) record.items = fields.items.map(lineFields);
  console.info('[cart-diagnostic]', record);
};

export const logCartSnapshot = (action, items, source, context = {}) => {
  const lines = Array.isArray(items) ? items : [];
  if (!lines.length) {
    logCartDiagnostic(action, { source, ...context });
    return;
  }
  lines.forEach((item) => logCartDiagnostic(action, { ...lineFields(item, source), source, ...context }));
};
