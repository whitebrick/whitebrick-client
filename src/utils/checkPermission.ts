export const CheckPermission = (type, userRole, cloudContext) => {

    // Only in the case of "My Databases"
    if(type === undefined) {
        return true;
    }

    const permittedRoles = cloudContext?.policy?.[type]?.permittedRoles;
    return permittedRoles?.includes(userRole);
}
