export const checkPermission = (type, userRole, cloudContext) => {
  // Only in the case of "My Databases"
  if (!type) return true;
  const permittedRoles = cloudContext?.policy?.[type]?.permittedRoles;
  return permittedRoles?.includes(userRole);
};
