const ALL = 'All';

const orderDate = (order) => String(order.createdAt || order.created_at || '').slice(0, 10);
const orderStores = (order) => [
  order.sourceStore,
  order.store,
  ...(order.fulfilmentAssignments || []).map((assignment) => assignment.store),
];
const orderLocations = (order) => [order.sourceLocation, order.location];

export const filterReportOrders = (orders, filters) => orders.filter((order) => {
  const date = orderDate(order);
  return (!filters.from || (date && date >= filters.from))
    && (!filters.to || (date && date <= filters.to))
    && (filters.location === ALL || orderLocations(order).includes(filters.location))
    && (filters.store === ALL || orderStores(order).includes(filters.store));
});

export const calculateStorePerformance = (stores, orders, sort = 'revenue') => stores
  .map((store) => {
    const rows = orders.filter((order) => orderStores(order).includes(store.name));
    return {
      name: store.name,
      location: store.location,
      orders: rows.length,
      revenue: rows.filter((order) => order.status !== 'Cancelled' && order.status !== 'CANCELLED')
        .reduce((sum, order) => sum + Number(order.total || 0), 0),
    };
  })
  .sort((left, right) => sort === 'name'
    ? left.name.localeCompare(right.name)
    : sort === 'orders' ? right.orders - left.orders : right.revenue - left.revenue);

// Exports deliberately omit customer contact details, addresses, payment data, and order items.
export const buildReportExport = ({ filters, orders, storePerformance }) => {
  const revenueOrders = orders.filter((order) => order.status !== 'Cancelled' && order.status !== 'CANCELLED');
  return {
    filters: { ...filters },
    summary: {
      orders: orders.length,
      revenue: revenueOrders.reduce((sum, order) => sum + Number(order.total || 0), 0),
      delivered: orders.filter((order) => order.status === 'Delivered' || order.status === 'DELIVERED').length,
    },
    storePerformance,
    orders: orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber || null,
      createdAt: order.createdAt || order.created_at || null,
      status: order.status || null,
      total: Number(order.total || 0),
      store: order.sourceStore || order.store || null,
      location: order.sourceLocation || order.location || null,
      fulfillmentType: order.fulfillmentType || null,
    })),
  };
};

export const downloadJsonReport = (payload, { documentRef = document, urlApi = URL, now = new Date(), schedule = (callback) => window.setTimeout(callback, 1000) } = {}) => {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = urlApi.createObjectURL(blob);
  const link = documentRef.createElement('a');
  const date = now.toISOString().slice(0, 10);
  link.href = url;
  link.download = `scoped-report-${date}.json`;
  link.style.display = 'none';
  try {
    documentRef.body.appendChild(link);
    link.click();
    // Keep the URL live long enough for the browser to begin resolving the download.
    schedule(() => urlApi.revokeObjectURL(url));
  } catch (error) {
    urlApi.revokeObjectURL(url);
    throw new Error(`The browser could not start the JSON download: ${error.message || 'download was blocked'}`, { cause: error });
  } finally {
    link.remove();
  }
  return link.download;
};
