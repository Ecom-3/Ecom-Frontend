const slugify = (value) => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const staffUsernameFrom = (data = {}) => {
  const supplied = String(data.username || '').trim();
  if (supplied) return supplied;
  const emailUsername = String(data.email || '').split('@')[0];
  return slugify(emailUsername || data.name) || `user${Date.now()}`;
};
