const objectSummary = (value, fields) => fields
  .filter((field) => value[field] !== undefined && value[field] !== null && value[field] !== '')
  .map((field) => `${field}: ${value[field]}`)
  .join(' | ');

export const formatAdminOrderDetailValue = (key, value) => {
  if (value == null) {
    if (key === 'fulfillment') return 'No fulfillment record is available for this order.';
    if (key === 'shipment') return 'No shipment record is available for this order.';
    return '—';
  }
  if (key === 'items' && Array.isArray(value)) {
    return value.length
      ? value.map((item) => objectSummary(item, ['productName', 'title', 'quantity', 'unitPrice', 'totalPrice']) || 'Order item').join('\n')
      : 'No order items are available.';
  }
  if (key === 'fulfillment' && typeof value === 'object') {
    return objectSummary(value, ['fulfillmentType', 'status', 'storeId']) || 'Fulfillment record loaded.';
  }
  if (key === 'shipment' && typeof value === 'object') {
    return objectSummary(value, ['status', 'carrier', 'trackingNumber', 'shippedAt', 'estimatedDeliveryDate']) || 'Shipment record loaded.';
  }
  if (key === 'trackingHistory' && Array.isArray(value)) {
    return value.length ? value.join('\n') : 'No tracking events are available.';
  }
  if (key === 'notificationHistory' && Array.isArray(value)) {
    return value.length ? value.join('\n') : 'No notifications are available.';
  }
  if (Array.isArray(value)) return value.map((entry) => typeof entry === 'object' && entry !== null ? JSON.stringify(entry) : entry).join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};
