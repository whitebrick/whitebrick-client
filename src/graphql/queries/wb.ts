export const SCHEMAS_QUERY: string = `query {
  wbMySchemas {
    name
    label
    userOwnerEmail
    organizationOwnerName
    role{
      name
    }
  }
}`;

export const SCHEMA_BY_NAME_QUERY: string = `query ($name: String!, $organizationName: String) {
  wbMySchemaByName(name: $name, organizationName: $organizationName) {
    name
    label
    userOwnerEmail
    organizationOwnerName
    role {
      name
    }
  }
}
`;

export const SCHEMA_TABLES_QUERY: string = `query ($schemaName: String!, $withColumns: Boolean){
  wbMyTables(schemaName: $schemaName, withColumns: $withColumns) {
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

export const SCHEMA_TABLE_BY_NAME_QUERY: string = `query ($schemaName: String!, $tableName: String!, $withColumns: Boolean) {
  wbMyTableByName(schemaName: $schemaName, tableName: $tableName, withColumns: $withColumns) {
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
}
`;

export const ORGANIZATIONS_QUERY: string = `{
  wbMyOrganizations {
    name
    label
    role{
      name
    }
  }
}
`;

export const ORGANIZATION_QUERY: string = `query ($name: String!) {
  wbMyOrganizationByName(name: $name) {
    name
    label
    role {
      name
    }
  }
  wbOrganizationUsers(organizationName: $name) {
    userFirstName
    userLastName
    userEmail
    role {
      name
      impliedFrom
      permissions
    }
  }
}
`;

export const TABLE_USERS_QUERY = `query ($schemaName: String!, $tableName: String!){
  wbTableUsers(schemaName: $schemaName, tableName: $tableName){
    userEmail
    role
    roleImpliedFrom
  }
}`;

export const SCHEMA_USERS_QUERY = `query ($schemaName: String!){
  wbSchemaUsers(schemaName: $schemaName){
    userId
    userFirstName
    userLastName
    userEmail
    role{
      name
      impliedFrom
      permissions
    }
  }
}`;

export const USERS_SEARCH_PATTERN = `query ($searchPattern: String!){
  wbUsersBySearchPattern(searchPattern: $searchPattern){
    firstName
    lastName
    email
  }
}`;
