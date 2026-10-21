const idValue = (value) => value == null ? '' : String(value);

export const sameCartLine = (left, right) => Boolean(
  left?.productId && right?.productId
  && idValue(left.productId) === idValue(right.productId)
  && idValue(left.variantId) === idValue(right.variantId)
  && (!left.storeId || !right.storeId || idValue(left.storeId) === idValue(right.storeId)),
);

export const planCartLineMutation = (lines, target, quantityDelta = 1, cartId = '') => {
  const existing = lines.find((line) =>
    sameCartLine(line, target) && (!cartId || idValue(line.cartId) === idValue(cartId)),
  );
  return existing?.id
    ? { type: 'update', line: existing, quantity: Number(existing.quantity || 0) + Number(quantityDelta) }
    : { type: 'add', line: null, quantity: Number(quantityDelta) };
};
