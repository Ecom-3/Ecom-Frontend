import test from 'node:test';
import assert from 'node:assert/strict';
import { assignDeliveryPartnerForShipment, retryFailedCarrierDelivery } from './deliveryPartnerAssignmentWorkflow.js';

const input = (status = 'FAILED') => ({
  shipment: { id: 'qa-shipment', status },
  order: { sourceStore: 'Hyderabad QA store' },
  partner: { id: 'qa-partner', name: 'Verified QA Partner', mobile: '5550100', vehicleNumber: 'QA-1' },
});

test('failed shipment retry assigns first, then records its timeline event', async () => {
  const calls = [];
  const saved = await assignDeliveryPartnerForShipment({
    ...input(),
    assignShipmentDeliveryPartner: async (id, body) => {
      calls.push(['assign', id, body]);
      return { id, status: 'CREATED', deliveryPartnerId: body.deliveryPartnerId };
    },
    addTrackingEvent: async (id, body) => { calls.push(['tracking', id, body]); },
  });

  assert.equal(saved.status, 'CREATED');
  assert.deepEqual(calls.map(([kind]) => kind), ['assign', 'tracking']);
  assert.equal(calls[0][2].deliveryPartnerName, 'Verified QA Partner');
  assert.equal(calls[1][2].status, 'CREATED');
});

test('failed assignment keeps the retryable state and does not write a success timeline event', async () => {
  const args = input();
  const failedShipment = args.shipment;
  let trackingCalls = 0;
  await assert.rejects(assignDeliveryPartnerForShipment({
    ...args,
    assignShipmentDeliveryPartner: async () => { throw new Error('partner assignment rejected'); },
    addTrackingEvent: async () => { trackingCalls += 1; },
  }), /partner assignment rejected/);

  assert.equal(failedShipment.status, 'FAILED');
  assert.equal(trackingCalls, 0);
});

test('ordinary assignment does not add a retry event', async () => {
  let trackingCalls = 0;
  await assignDeliveryPartnerForShipment({
    ...input('CREATED'),
    assignShipmentDeliveryPartner: async (id) => ({ id, status: 'CREATED' }),
    addTrackingEvent: async () => { trackingCalls += 1; },
  });
  assert.equal(trackingCalls, 0);
});

test('Location Admin carrier retry sends a stable key and selected verified partner', async () => {
  const calls = [];
  const result = await retryFailedCarrierDelivery({
    ...input(),
    idempotencyKey: 'qa-idempotency-key',
    retryCarrierShipment: async (id, body) => { calls.push([id, body]); return { outcome: 'SUCCEEDED' }; },
  });
  assert.equal(result.outcome, 'SUCCEEDED');
  assert.deepEqual(calls, [['qa-shipment', { idempotencyKey: 'qa-idempotency-key', deliveryPartnerId: 'qa-partner' }]]);
});

test('carrier retry refuses non-failed shipments and missing idempotency keys', async () => {
  const args = input('CREATED');
  await assert.rejects(retryFailedCarrierDelivery({ ...args, idempotencyKey: 'key', retryCarrierShipment: async () => ({}) }), /Only a failed shipment/);
  await assert.rejects(retryFailedCarrierDelivery({ ...input(), retryCarrierShipment: async () => ({}) }), /stable retry request ID/);
});
