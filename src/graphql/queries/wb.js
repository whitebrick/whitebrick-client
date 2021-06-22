export const SCHEMAS_QUERY = `query ($userEmail: String!) {
  wbSchemas(userEmail: $userEmail) {
    name
    label
    userOwnerEmail
    organizationOwnerName
  }
}`;

export const SCHEMA_TABLES_QUERY = `query ($schemaName: String!, $withColumns: Boolean){
  wbTables(schemaName: $schemaName, withColumns: $withColumns) {
    name
    label
    columns {
      name
      label
      type
      isPrimaryKey
      foreignKeys {
        columnName
        constraintName
        tableName
        relColumnName
        relTableName
      }
      referencedBy {
        columnName
        constraintName
        tableName
        relColumnName
        relTableName
      }
    }
  }
}`;

export const ORGANIZATIONS_QUERY = `query ($userEmail: String) {
  wbOrganizations(userEmail: $userEmail) {
    name
    label
    userRole
  }
}
`;

export const ORGANIZATION_QUERY = `query ($name: String!, $currentUserEmail: String!){
  wbOrganizationByName(name: $name, currentUserEmail: $currentUserEmail){
    name
    label
    userRole
    createdAt
  }
  wbOrganizationUsers(name: $name){
    firstName
    lastName
    email
    role
    createdAt
    updatedAt
  }
}`;
