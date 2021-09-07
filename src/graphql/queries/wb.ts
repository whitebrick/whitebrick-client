export const SCHEMAS_QUERY = `query {
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

export const SCHEMA_BY_NAME_QUERY = `query ($name: String!, $organizationName: String) {
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

export const SCHEMA_TABLES_QUERY = `query ($schemaName: String!){
  wbMyTables(schemaName: $schemaName) {
    name
    label
  }
}`;

export const SCHEMA_TABLE_BY_NAME_QUERY = `query ($schemaName: String!, $tableName: String!, $withColumns: Boolean, $withSettings: Boolean) {
  wbMyTableByName(schemaName: $schemaName, tableName: $tableName, withColumns: $withColumns, withSettings: $withSettings) {
    name
    label
    columns {
      name
      default
      label
      type
      isPrimaryKey
      foreignKeys {
        columnName
        constraintName
        tableName
        tableLabel
        relColumnName
        relTableName
        relTableLabel
      }
      referencedBy {
        columnName
        constraintName
        tableName
        tableLabel
        relColumnName
        relTableName
        relTableLabel
      }
    }
    settings
  }
}
`;

export const ORGANIZATIONS_QUERY = `{
  wbMyOrganizations {
    name
    label
    role{
      name
    }
  }
}
`;

export const ORGANIZATION_QUERY = `query ($name: String!) {
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

export const ORGANIZATION_USERS_QUERY = `query ($name: String!) {
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

export const USER_BY_EMAIL = `query ($email: String!) {
  wbUserByEmail(email: $email) {
    firstName
    lastName
    email
  }
}
`;

export const COLUMNS_BY_NAME_QUERY = `query ($schemaName: String!, $tableName: String!) {
  wbColumns(schemaName: $schemaName, tableName: $tableName) {
    name
    default
    label
    type
    isPrimaryKey
    foreignKeys {
      columnName
      constraintName
      tableName
      tableLabel
      relColumnName
      relTableName
      relTableLabel
    }
    referencedBy {
      columnName
      constraintName
      tableName
      tableLabel
      relColumnName
      relTableName
      relTableLabel
    }
  }
}`;
