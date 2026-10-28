export const updateStaffProfile = async ({
  profile = {},
  authenticatedUser,
  changePassword,
  updateMyName,
}) => {
  if (!authenticatedUser?.id) throw new Error('No staff user is signed in.');
  if (profile.newPassword) await changePassword({
    currentPassword: profile.currentPassword,
    newPassword: profile.newPassword,
  });

  const mayUpdateName = authenticatedUser.role !== 'store-manager';
  const saved = profile.name && mayUpdateName
    ? await updateMyName(profile.name)
    : authenticatedUser;
  return { ...authenticatedUser, ...saved, name: saved?.name || authenticatedUser.name || profile.name };
};
