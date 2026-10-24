export const getLowStockInventory = (inventory) => inventory.filter((item) => {
  const status = String(item?.status || '').toUpperCase();
  const available = item?.availableQuantity;
  const reorderLevel = item?.reorderLevel;
  if (!['ACTIVE', 'OUT_OF_STOCK'].includes(status) || available == null || reorderLevel == null) return false;
  const availableQuantity = Number(available);
  const threshold = Number(reorderLevel);
  return Number.isFinite(availableQuantity) && Number.isFinite(threshold) && availableQuantity <= threshold;
});

export const countLowStockInventory = (inventory) => getLowStockInventory(inventory).length;
