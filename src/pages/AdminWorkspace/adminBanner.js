const BANNER_STATUS_TO_API = { Active: 'ACTIVE', Scheduled: 'SCHEDULED', Inactive: 'INACTIVE' };

export const toBannerPayload = (form, user, assignedStoreId = null) => {
  const storeManager = user?.role === 'store-manager';
  if (storeManager && !assignedStoreId) throw new Error('No store is assigned to this manager.');
  const scope = storeManager
    ? 'STORE'
    : String(form.scope || (form.targetStore || form.store ? 'Store' : form.location ? 'Location' : 'Global')).toUpperCase();
  return {
    title: String(form.name || '').trim(),
    description: form.description || null,
    imageUrl: form.image || '',
    mobileImageUrl: form.mobileImage || null,
    targetUrl: form.targetUrl || null,
    scope,
    locationId: storeManager ? null : scope === 'GLOBAL' ? null : form.location || null,
    storeId: storeManager ? assignedStoreId : scope === 'STORE' ? form.targetStore || form.store || null : null,
    sortOrder: Number(form.sortOrder) || 0,
    status: BANNER_STATUS_TO_API[form.status] || 'ACTIVE',
    startsOn: form.startDate || null,
    endsOn: form.endDate || null,
  };
};
