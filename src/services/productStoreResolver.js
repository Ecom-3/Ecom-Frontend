const productKey = (product = {}) => product.productId || product.id || product.product_id || '';

const storeInfo = (product = {}) => {
  const storeId = product.storeId || product.sourceStoreId || '';
  const storeName = product.storeName || product.store || product.sourceStore || storeId;
  if (!storeId && !storeName) return null;
  return {
    storeId,
    store: storeName,
    storeName,
    location: product.storeLocation || product.location || '',
    state: product.storeState || product.state || '',
  };
};

// Store associations come from catalog/cart API records; they are never
// inferred from a browser-persisted product/store index.
export const rememberProductStore = (product = {}) => storeInfo(product);

export const resolveProductStore = (product = {}, catalogProducts = []) => {
  const direct = storeInfo(product);
  if (direct) return direct;

  const key = productKey(product);
  const match = catalogProducts.find((item) => productKey(item) === key
    || (product.title && item.title === product.title)
    || (product.productName && item.name === product.productName));
  return storeInfo(match || {});
};
