export const SCHEMAS_QUERY: string = `query {
  wbSchemas {
    name
    label
    userOwnerEmail
    organizationOwnerName
  }
}`;

export const SCHEMA_TABLES_QUERY: string = `query ($schemaName: String!, $withColumns: Boolean){
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

export const ORGANIZATIONS_QUERY: string = `query {
  wbOrganizations {
    name
    label
    userRole
  }
}
`;

export const ORGANIZATION_QUERY: string = `query ($name: String!, $currentUserEmail: String!){
  wbOrganizationByName(name: $name, currentUserEmail: $currentUserEmail){
    name
    label
    userRole
  }
  wbOrganizationUsers(organizationName: $name){
    userEmail
    role
    createdAt
    updatedAt
  }
}`;

export const TABLE_USERS_QUERY = `query ($schemaName: String!, $tableName: String!){
  wbTableUsers(schemaName: $schemaName, tableName: $tableName){
    userEmail
    role
    roleImpliedFrom
  }
}`;

export const SCHEMA_USERS_QUERY = `query ($schemaName: String!){
  wbSchemaUsers(schemaName: $schemaName){
    userEmail
    role
    roleImpliedFrom
  }
}`;
