export const assignDeliveryPartnerForShipment = async ({
  shipment,
  order,
  partner,
  assignShipmentDeliveryPartner,
  addTrackingEvent,
}) => {
  const assignment = await assignShipmentDeliveryPartner(shipment.id, {
    deliveryPartnerId: String(partner.id),
    deliveryPartnerName: partner.name,
    deliveryPartnerPhone: partner.phone || partner.mobile || '',
    vehicleNumber: partner.vehicleNumber || partner.vehicle || '',
  });

  // The backend validates eligibility and resets FAILED atomically during assignment.
  // Only add the retry timeline event after that operation has persisted successfully.
  if (shipment.status === 'FAILED') {
    await addTrackingEvent(shipment.id, {
      status: 'CREATED',
      location: order.sourceStore || order.store || 'Store hub',
      description: `Delivery retry: reassigned to ${partner.name}.`,
      eventTime: new Date().toISOString(),
    }).catch(() => {});
  }
  return assignment;
};

export const retryFailedCarrierDelivery = async ({ shipment, partner, idempotencyKey, retryCarrierShipment }) => {
  if (shipment?.status !== 'FAILED') throw new Error('Only a failed shipment can be retried.');
  if (!idempotencyKey) throw new Error('A stable retry request ID is required.');
  return retryCarrierShipment(shipment.id, {
    idempotencyKey,
    deliveryPartnerId: String(partner.id),
  });
};
