export const validateStaffPasswordChange = ({
  currentPassword = '',
  newPassword = '',
  confirmPassword = '',
  required = false,
} = {}) => {
  const errors = {};
  const current = String(currentPassword);
  const next = String(newPassword);
  const confirmation = String(confirmPassword);

  if (required && !current) errors.currentPassword = 'Enter your current password.';
  if (required && !next) errors.newPassword = 'Enter a new password.';
  if (next && !current) errors.currentPassword = 'Enter your current password to change it.';
  if (next && next.length < 8) errors.newPassword = 'New password must contain at least 8 characters.';
  if (next && next !== confirmation) errors.confirmPassword = 'New passwords do not match.';
  return errors;
};
