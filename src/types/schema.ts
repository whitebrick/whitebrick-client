export type SchemaItemType = {
  name: string;
  label: string;
  userOwnerEmail: string;
  organizationOwnerName: string;
  status: 'Ready' | 'Rebuilding';
  role: {
    name: string;
  };
};
