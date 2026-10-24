export const isCustomerSession = ({ role, tokenCustomerId } = {}) => {
  const normalizedRole = String(role || '').trim().toLowerCase().replace(/_/g, '-');
  return normalizedRole === 'customer' || Boolean(tokenCustomerId);
};

export const resolveCustomerId = ({ role, tokenCustomerId, userId } = {}) =>
  tokenCustomerId || (isCustomerSession({ role, tokenCustomerId }) ? userId || null : null);
