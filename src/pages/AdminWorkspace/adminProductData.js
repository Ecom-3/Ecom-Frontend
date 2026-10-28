export const productImageForForm = (item = {}) =>
  (item.images || []).find((image) => image.primaryImage)?.url ||
  item.images?.[0]?.url || item.image || item.imageUrl || '';
