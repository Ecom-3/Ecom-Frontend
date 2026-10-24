export const numericValue = (value) => {
  if (!['number', 'string'].includes(typeof value) || String(value).trim() === '') return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
};

export const parseDeliveryEstimate = (value) => {
  if (typeof value === 'number') return value > 0 && Number.isFinite(value) ? { min: value, max: value } : null;
  const match = String(value ?? '').trim().match(/^(\d+(?:\.\d+)?)\s*(?:[-–—]\s*(\d+(?:\.\d+)?))?\s*(min(?:ute)?s?|hours?|hrs?|days?)?(?:\s+delivery)?$/i);
  if (!match) return null;
  const factor = /^h/i.test(match[3] || '') ? 60 : /^d/i.test(match[3] || '') ? 1440 : 1;
  const min = Number(match[1]) * factor;
  const max = Number(match[2] || match[1]) * factor;
  return Number.isFinite(min) && Number.isFinite(max) && min > 0 && max >= min ? { min, max } : null;
};

export const productDeliveryEstimate = (product, store = {}) => {
  const quote = product.deliveryQuote;
  if (quote) {
    if (!quote.deliveryAvailable) return null;
    const method = quote.methods?.find(item => item.deliveryType === quote.selectedDeliveryMethod) || quote.methods?.[0];
    return parseDeliveryEstimate(method?.estimatedTime);
  }
  if (product.deliveryLabel) return parseDeliveryEstimate(product.deliveryLabel);
  return parseDeliveryEstimate(store.deliveryEtaMinutes ?? product.deliveryEtaMinutes ?? product.deliveryMinutes);
};

const yes = value => value === true || ['yes', 'true'].includes(String(value).toLowerCase());
const no = value => value === false || ['no', 'false'].includes(String(value).toLowerCase());
const normalized = value => String(value ?? '').trim().toLowerCase();
const categoryMatches = (product, category) => normalized(product.category?.name || product.category) === normalized(category)
  || String(product.categoryId) === String(category);

export const prepareBrowseProduct = (product, stores = [], reviews = []) => {
  // A store mapping wins over names on the master product.
  const store = stores.find(item => product.storeId ? item.id === product.storeId : item.name === product.store || item.name === product.storeName) || {};
  const productReviews = reviews.filter(review => String(review.status || '').toUpperCase() === 'APPROVED' && review.active !== false
    && (review.productId === (product.productId || product.id) || review.product === product.title)
    && numericValue(review.rating) > 0 && numericValue(review.rating) <= 5);
  const suppliedRating = numericValue(product.rating);
  const rating = productReviews.length ? productReviews.reduce((sum, review) => sum + Number(review.rating), 0) / productReviews.length
    : suppliedRating > 0 && suppliedRating <= 5 ? suppliedRating : null;
  const modes = Array.isArray(store.deliveryModes || product.deliveryModes) ? (store.deliveryModes || product.deliveryModes) : String(store.deliveryModes || product.deliveryModes || '').split(',');
  const pickupSetting = store.pickupEnabled ?? store.pickup ?? product.pickupEnabled ?? product.pickup;
  const pickup = product.fulfillmentType !== 'global' && !no(pickupSetting)
    && (yes(pickupSetting) || modes.some(mode => /pickup/i.test(mode)));
  // Sort the price rendered on the listing, which may override the base variant.
  const price = product.priceKnown === false ? null : numericValue(product.price ?? product.selectedVariant?.price ?? product.variants?.[0]?.price);
  const compareAt = numericValue(product.compareAtPrice ?? product.basePrice);
  const deliveryEstimate = productDeliveryEstimate(product, store);
  const created = product.createdAt ? Date.parse(product.createdAt) : NaN;
  return {
    ...product, rating, ratingCount: productReviews.length || numericValue(product.ratingCount), pickup,
    browsePrice: price, deliveryEstimate, under30: Boolean(deliveryEstimate && deliveryEstimate.max < 30),
    offer: numericValue(product.discount) > 0 || (price !== null && compareAt !== null && compareAt > price),
    popularity: numericValue(product.popularity) ?? (yes(product.bestSeller) ? 100 : null),
    newest: Number.isFinite(created) ? created : null,
  };
};

const compare = (left, right, direction = 1) => left == null ? (right == null ? 0 : 1) : right == null ? -1 : (left - right) * direction;
export const filterAndSortProducts = (products, { query = '', category = 'all', maxPrice = 'all', rating = 'all', availability = 'all', sort = 'popularity', nameOnly = false, matchedIds } = {}) => {
  const term = normalized(query);
  return products.filter(product => {
    const fields = nameOnly ? [product.title, product.name] : [product.title, product.name, product.description, product.category, product.subcategory, product.ingredients, product.tags, product.store, product.storeName];
    const text = fields.filter(Boolean).join(' ').toLowerCase();
    return (!term || text.includes(term) || matchedIds?.has(String(product.productId || product.id || '')))
      && (category === 'all' || categoryMatches(product, category))
      && (maxPrice === 'all' || (product.browsePrice != null && product.browsePrice < Number(maxPrice)))
      && (rating === 'all' || (product.rating != null && product.rating >= Number(rating)))
      && (availability === 'all' || (availability === 'pickup' ? product.pickup : availability === 'under30' ? product.under30 : false));
  }).sort((a, b) => {
    if (sort === 'price-low') return compare(a.browsePrice, b.browsePrice);
    if (sort === 'price-high') return compare(a.browsePrice, b.browsePrice, -1);
    if (sort === 'newest') return compare(a.newest, b.newest, -1);
    if (sort === 'under30') return compare(a.deliveryEstimate?.max, b.deliveryEstimate?.max) || compare(a.deliveryEstimate?.min, b.deliveryEstimate?.min);
    if (sort === 'pickup' || sort === 'offers') {
      const key = sort === 'pickup' ? 'pickup' : 'offer';
      return Number(b[key]) - Number(a[key]) || compare(a.popularity, b.popularity, -1);
    }
    return compare(a.popularity, b.popularity, -1);
  });
};
