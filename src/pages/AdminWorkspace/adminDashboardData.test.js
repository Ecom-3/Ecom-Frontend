import test from 'node:test';
import assert from 'node:assert/strict';
import { countLowStockInventory, getLowStockInventory } from './adminDashboardData.js';

test('low-stock count uses normalized inventory quantities and excludes inactive records', () => {
  assert.equal(countLowStockInventory([
    { status: 'ACTIVE', availableQuantity: 2, reorderLevel: 5 },
    { status: 'OUT_OF_STOCK', availableQuantity: 0, reorderLevel: 5 },
    { status: 'ACTIVE', availableQuantity: 8, reorderLevel: 5 },
    { status: 'INACTIVE', availableQuantity: 0, reorderLevel: 5 },
    { status: 'ACTIVE', availableQuantity: null, reorderLevel: 5 },
    { status: 'ACTIVE', availableQuantity: 1, reorderLevel: undefined },
  ]), 2);
});

test('low-stock count handles empty inventory as a valid zero', () => {
  assert.equal(countLowStockInventory([]), 0);
  assert.deepEqual(getLowStockInventory([]), []);
});
