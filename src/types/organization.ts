export type OrganizationItemType = {
  name: string;
  label: string;
  userRole:
    | 'organization_administrator'
    | 'organization_user'
    | 'organization_external_user';
};
