import test from 'node:test';
import assert from 'node:assert/strict';
import { fulfillmentTypeForOrder, workflowActionForOrderStatus } from './orderWorkflowRouting.js';

test('global order status changes use the fulfillment workflow actions', () => {
  assert.equal(workflowActionForOrderStatus('CONFIRMED'), 'CONFIRM');
  assert.equal(workflowActionForOrderStatus('PROCESSING'), 'PACKING');
  assert.equal(workflowActionForOrderStatus('SHIPPED'), 'SHIP');
  assert.equal(workflowActionForOrderStatus('DELIVERED'), 'DELIVER');
  assert.equal(workflowActionForOrderStatus('CANCELLED'), null);
});

test('fulfillment requests preserve the order fulfillment type', () => {
  assert.equal(fulfillmentTypeForOrder({ fulfillmentType: 'global' }), 'GLOBAL');
  assert.equal(fulfillmentTypeForOrder({ fulfillmentType: 'india-wide' }), 'GLOBAL');
  assert.equal(fulfillmentTypeForOrder({ fulfillmentType: 'pickup' }), 'STORE_PICKUP');
  assert.equal(fulfillmentTypeForOrder({ fulfillmentType: 'digital' }), 'DIGITAL');
  assert.equal(fulfillmentTypeForOrder({ fulfillmentType: 'ship_to_home' }), 'SHIP_TO_HOME');
});
