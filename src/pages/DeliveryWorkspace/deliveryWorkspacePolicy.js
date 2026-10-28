export const normalizeOtpInput = (value) => String(value || '').replace(/\D/g, '').slice(0, 6);

export const orderedTrackingEvents = (events) => (Array.isArray(events) ? [...events] : []).sort((a, b) => {
  const first = Date.parse(a?.eventTime);
  const second = Date.parse(b?.eventTime);
  if (!Number.isFinite(first)) return Number.isFinite(second) ? 1 : 0;
  if (!Number.isFinite(second)) return -1;
  return first - second;
});

export const passwordChangeErrors = ({ current = '', next = '', confirm = '' } = {}) => {
  if (!current && !next && !confirm) return {};
  const errors = {};
  if (!current) errors.current = 'Enter your current password.';
  else if (current.length > 100) errors.current = 'Current password is too long.';
  if (!next) errors.next = 'Enter a new password.';
  else if (next.length < 8) errors.next = 'New password must be at least 8 characters.';
  else if (next.length > 100) errors.next = 'New password cannot exceed 100 characters.';
  if (next && next !== confirm) errors.confirm = 'New passwords do not match.';
  return errors;
};
