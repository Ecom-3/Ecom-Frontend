const API_SCOPE = { Global: 'GLOBAL', Location: 'LOCATION', Store: 'STORE' };

export const toCouponPayload = (form, user, assignedStoreId = null) => {
  const role = user?.role;
  if (role === 'store-manager' && !assignedStoreId) throw new Error('No store is assigned to this manager.');
  const scope = role === 'global-admin'
    ? 'Global'
    : role === 'store-manager'
      ? 'Store'
      : role === 'location-admin'
        ? (form.targetStore ? 'Store' : 'Location')
        : (form.scope || 'Global');
  const location = role === 'global-admin' || role === 'store-manager'
    ? ''
    : role === 'location-admin'
      ? user?.location || ''
      : form.location || '';
  const store = role === 'store-manager'
    ? assignedStoreId || ''
    : role === 'location-admin'
      ? form.targetStore || ''
      : scope === 'Store'
        ? form.store || ''
        : '';

  return {
    code: String(form.name || form.code || '').trim().toUpperCase(),
    couponName: String(form.couponName || '').trim(),
    description: form.description || null,
    discountType: String(form.discountType || 'Percentage').toUpperCase(),
    discount: Number(form.discount),
    minimumOrder: Number(form.minimumOrder || 0),
    maximumDiscount: form.maximumDiscount === '' || form.maximumDiscount == null ? null : Number(form.maximumDiscount),
    startDate: form.startDate,
    expiry: form.expiry,
    usageLimit: Number(form.usageLimit),
    perUserLimit: form.perUserLimit === '' || form.perUserLimit == null ? null : Number(form.perUserLimit),
    scope: API_SCOPE[scope] || String(scope).toUpperCase(),
    location: location || null,
    store: store || null,
    product: form.product || null,
    category: form.category || null,
    eligibility: form.eligibility || 'All customers',
    status: String(form.status || 'Active').toUpperCase(),
  };
};
