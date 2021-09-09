import store from '../state/store';

export const checkPermission = (type, userRole) => {
  const state = store.getState();
  // Only in the case of "My Databases"
  if (!type) return true;
  const permittedRoles = state.cloudContext?.policy?.[type]?.permittedRoles;
  return permittedRoles?.includes(userRole);
};
