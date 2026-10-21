import test from 'node:test';
import assert from 'node:assert/strict';
import { filterAndSortProducts, parseDeliveryEstimate, prepareBrowseProduct, productDeliveryEstimate } from './productBrowsing.js';
import { deliverySummary, deliveryProducts } from './storeDelivery.js';

const ids = products => products.map(item => item.id);
const prepare = rows => rows.map(item => prepareBrowseProduct(item));
const products = prepare([
  { id: 'fast', title: 'Mango pickle', category: 'Pickles', price: 120, rating: 4.5, pickup: true, deliveryEtaMinutes: '20–25 min', bestSeller: 'Yes', createdAt: '2026-01-02', compareAtPrice: 150 },
  { id: 'range', title: 'Lemon pickle', category: 'Pickles', price: 200, rating: 5, deliveryEtaMinutes: '30-35 minutes', createdAt: '2026-03-02' },
  { id: 'slow', title: 'Whole spice', category: 'Spices', price: 80, rating: 3, pickup: 'Yes', deliveryEtaMinutes: '40 min', createdAt: '2026-02-02' },
  { id: 'boundary', title: 'Garlic pickle', category: 'Pickles', price: 150, deliveryEtaMinutes: 30 },
  { id: 'unknown', title: 'Unknown pickle', price: null, deliveryEtaMinutes: 'soon' },
]);

test('delivery ranges and single values parse consistently', () => {
  for (const value of ['20–25 min', '20-25 minutes', '20—25 mins']) assert.deepEqual(parseDeliveryEstimate(value), { min: 20, max: 25 });
  assert.deepEqual(parseDeliveryEstimate('30-35 minutes'), { min: 30, max: 35 });
  assert.deepEqual(parseDeliveryEstimate('40 min'), { min: 40, max: 40 });
  assert.deepEqual(parseDeliveryEstimate('5-7 days delivery'), { min: 7200, max: 10080 });
});

test('invalid and missing estimates stay unknown', () => {
  for (const value of [null, undefined, '', 'soon', '25-20 min', '20-25 seconds', '0 min', -5, Infinity, {}, true, '20 min or 2 days']) {
    assert.equal(parseDeliveryEstimate(value), null, String(value));
  }
});

test('under 30 excludes 30–35, exactly 30, and unknown estimates', () => {
  assert.deepEqual(ids(filterAndSortProducts(products, { availability: 'under30' })), ['fast']);
});

test('delivery sort retains all products and orders by maximum estimate, unknown last', () => {
  assert.deepEqual(ids(filterAndSortProducts(products, { sort: 'under30' })), ['fast', 'boundary', 'range', 'slow', 'unknown']);
});

test('both price sorts keep unknown prices last without mutating input', () => {
  const before = JSON.stringify(products);
  assert.deepEqual(ids(filterAndSortProducts(products, { sort: 'price-low' })), ['slow', 'fast', 'boundary', 'range', 'unknown']);
  assert.deepEqual(ids(filterAndSortProducts(products, { sort: 'price-high' })), ['range', 'boundary', 'fast', 'slow', 'unknown']);
  assert.equal(JSON.stringify(products), before);
});

test('search, category, price, rating and availability combine with AND', () => {
  assert.deepEqual(ids(filterAndSortProducts(products, { query: ' PICKLE ', category: 'Pickles', maxPrice: '150', rating: '4', availability: 'pickup', sort: 'price-high' })), ['fast']);
  assert.deepEqual(ids(filterAndSortProducts(products, { rating: '5' })), ['range']);
  assert.deepEqual(ids(filterAndSortProducts(products, { category: 'Spices' })), ['slow']);
  assert.deepEqual(ids(filterAndSortProducts(products, { maxPrice: '150', sort: 'price-low' })), ['slow', 'fast']);
});

test('clearing filters preserves the query and chosen sort and restores matching products', () => {
  const options = { query: 'pickle', sort: 'price-high', rating: '5', maxPrice: '150' };
  assert.equal(filterAndSortProducts(products, options).length, 0);
  const cleared = { ...options, rating: 'all', maxPrice: 'all' };
  assert.deepEqual(ids(filterAndSortProducts(products, cleared)), ['range', 'boundary', 'fast', 'unknown']);
  assert.equal(cleared.sort, 'price-high');
});

test('newest, popularity, offers and pickup use actual supplied fields', () => {
  assert.deepEqual(ids(filterAndSortProducts(products, { sort: 'newest' })), ['range', 'slow', 'fast', 'boundary', 'unknown']);
  assert.equal(filterAndSortProducts(products, { sort: 'popularity' })[0].id, 'fast');
  assert.equal(filterAndSortProducts(products, { sort: 'offers' })[0].id, 'fast');
  assert.deepEqual(ids(filterAndSortProducts(products, { availability: 'pickup', sort: 'pickup' })), ['fast', 'slow']);
});

test('the displayed quote method overrides a misleading numeric store ETA', () => {
  const product = { deliveryEtaMinutes: 20, deliveryQuote: { deliveryAvailable: true, selectedDeliveryMethod: 'Express', methods: [
    { deliveryType: 'Standard', estimatedTime: '20–25 min' }, { deliveryType: 'Express', estimatedTime: '30–35 min' },
  ] } };
  assert.deepEqual(productDeliveryEstimate(product, { deliveryEtaMinutes: 15 }), { min: 30, max: 35 });
  assert.equal(prepareBrowseProduct(product).under30, false);
  product.deliveryQuote.methods[1].estimatedTime = null;
  assert.equal(productDeliveryEstimate(product), null);
  product.deliveryQuote.deliveryAvailable = false;
  assert.equal(productDeliveryEstimate(product), null);
});

test('store mapping selects its own ETA and pickup instead of master-store data', () => {
  const stores = [{ id: 'a', name: 'A', deliveryEtaMinutes: 20, pickup: 'Yes' }, { id: 'b', name: 'B', deliveryEtaMinutes: '30–35 min', pickup: false }];
  const product = prepareBrowseProduct({ id: 'p', storeId: 'b', store: 'A', pickup: true, price: 100 }, stores);
  assert.equal(product.under30, false);
  assert.equal(product.pickup, false);
  assert.equal(deliverySummary(stores[1]).etaLabel, '30–35 min delivery');
});

test('valid catalog ratings survive absent reviews; malformed values never qualify', () => {
  const product = { id: 'p', rating: 4.8, price: 100 };
  assert.equal(prepareBrowseProduct(product).rating, 4.8);
  assert.equal(prepareBrowseProduct(product, [], [{ productId: 'p', rating: 5, status: 'Approved' }]).rating, 5);
  assert.equal(prepareBrowseProduct({ rating: 7 }).rating, null);
  const unknown = prepareBrowseProduct({ price: 0, priceKnown: false });
  assert.equal(filterAndSortProducts([unknown], { maxPrice: '150' }).length, 0);
});

test('delivery eligibility and global fulfillment continue to constrain browsing', () => {
  const store = { id: 'local', name: 'Local', latitude: 17, longitude: 78, deliveryRadiusKm: 10, deliveryEtaMinutes: 25, pickup: 'Yes' };
  const master = { id: 'p', title: 'Pickle', storeId: 'local', globalProduct: true, price: 199 };
  const eligible = deliveryProducts([master], [], [store], { latitude: 17, longitude: 78 }).map(item => prepareBrowseProduct(item, [store]));
  assert.equal(eligible.length, 2);
  assert.equal(filterAndSortProducts(eligible, { availability: 'under30' }).length, 1);
  assert.equal(eligible.find(item => item.fulfillmentType === 'global').pickup, false);
});

test('pickupEnabled from the API wins over legacy modes and missing flags', () => {
  const product = { id: 'p', storeId: 'store' };
  assert.equal(prepareBrowseProduct(product, [{ id: 'store', pickupEnabled: true }]).pickup, true);
  assert.equal(prepareBrowseProduct(product, [{ id: 'store', pickupEnabled: false, deliveryModes: 'Store Pickup' }]).pickup, false);
  assert.equal(prepareBrowseProduct(product).pickup, false);
});

test('Home keeps name search while Search can match existing metadata', () => {
  const rows = prepare([{ id: 'vegetable', title: 'Spinach', store: 'Pickle House', price: 20 }]);
  assert.equal(filterAndSortProducts(rows, { query: 'pickle', nameOnly: true }).length, 0);
  assert.equal(filterAndSortProducts(rows, { query: 'pickle' }).length, 1);
});

test('API search matches still obey local filters and cannot introduce ineligible listings', () => {
  const matchedIds = new Set(['fast', 'not-in-delivery-pool']);
  assert.deepEqual(ids(filterAndSortProducts(products, { query: 'API-only term', matchedIds })), ['fast']);
  assert.equal(filterAndSortProducts(products, { query: 'API-only term', matchedIds, category: 'Spices' }).length, 0);
});
