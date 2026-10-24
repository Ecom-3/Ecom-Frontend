export const orderAssignmentPath = (order, role) => {
  if (!order?.id) return null;
  if (order.fulfillmentType === 'global') {
    if (!['super-admin', 'global-admin'].includes(role)) return null;
    return `/admin/orders/assign/${encodeURIComponent(order.id)}`;
  }
  if (!['super-admin', 'global-admin', 'location-admin', 'store-manager'].includes(role)) return null;
  return `/admin/orders/delivery/${encodeURIComponent(order.id)}`;
};
