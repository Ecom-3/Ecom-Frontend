export const profileModeRequiresAssignedStore = (mode) => mode !== 'change-password';

export const profileModeWaitsForAssignedStore = (mode, loading, store) =>
  profileModeRequiresAssignedStore(mode) && (loading || !store);
