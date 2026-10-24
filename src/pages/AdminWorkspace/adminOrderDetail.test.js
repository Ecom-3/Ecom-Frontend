import test from 'node:test';
import assert from 'node:assert/strict';
import { formatAdminOrderDetailValue } from './adminOrderDetail.js';

test('renders available order items as readable item summaries', () => {
  assert.equal(formatAdminOrderDetailValue('items', [{ productName: 'Tea', quantity: 2, unitPrice: 15 }]), 'productName: Tea | quantity: 2 | unitPrice: 15');
});

test('explains absent fulfillment and shipment records without hiding other nulls', () => {
  assert.match(formatAdminOrderDetailValue('fulfillment', null), /No fulfillment record/);
  assert.match(formatAdminOrderDetailValue('shipment', null), /No shipment record/);
  assert.equal(formatAdminOrderDetailValue('paymentStatus', null), '—');
});

test('renders tracking history as a clear empty state or event list', () => {
  assert.equal(formatAdminOrderDetailValue('trackingHistory', []), 'No tracking events are available.');
  assert.equal(formatAdminOrderDetailValue('trackingHistory', ['SHIPPED | Carrier hub']), 'SHIPPED | Carrier hub');
});
