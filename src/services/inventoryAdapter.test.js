import test from 'node:test';
import assert from 'node:assert/strict';
import { toInventoryUpdatePayload } from './inventoryAdapter.js';

test('inventory edits send mutable stock fields without changing product, variant, or store ownership', () => {
  assert.deepEqual(toInventoryUpdatePayload({
    productId: 'product-a',
    variantId: 'variant-a',
    storeId: 'store-a',
    availableQuantity: '60',
    reservedQuantity: '2',
    reorderLevel: '12',
    status: 'ACTIVE',
    version: 4,
  }), {
    availableQuantity: 60,
    reservedQuantity: 2,
    reorderLevel: 12,
    status: 'ACTIVE',
  });
});
