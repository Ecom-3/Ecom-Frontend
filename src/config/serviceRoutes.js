// Prefixes must match the API gateway's Path predicates.
export const serviceRoutes = {
  orgAccess: { prefix: '/org-access', override: 'VITE_ORG_ACCESS_URL' },
  customerProfile: { prefix: '/customer-profile', override: 'VITE_CUSTOMER_PROFILE_URL' },
  catalog: { prefix: '/catalog-service', override: 'VITE_CATALOG_URL' },
  inventory: { prefix: '/inventory-service', override: 'VITE_INVENTORY_URL' },
  payment: { prefix: '/payment-service', override: 'VITE_PAYMENT_URL' },
  alerts: { prefix: '/alerts-service', override: 'VITE_ALERTS_URL' },
  notification: { prefix: '/notification-service', override: 'VITE_NOTIFICATION_URL' },
  order: { prefix: '/order-api', override: 'VITE_ORDER_URL' },
  cart: { prefix: '/cart-api', override: 'VITE_CART_URL' },
  fulfillment: { prefix: '/fulfillment', override: 'VITE_FULFILLMENT_URL' },
};

export const serviceBaseUrl = (service, env = {}) => {
  const route = serviceRoutes[service];
  if (!route) throw new Error(`Unknown backend service: ${service}`);
  const gateway = (env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
  return (env[route.override] || `${gateway}${route.prefix}`).replace(/\/+$/, '');
};

export const createServiceProxy = (target) => Object.fromEntries(
  Object.values(serviceRoutes).map(({ prefix }) => [prefix, { target, changeOrigin: true }]),
);
