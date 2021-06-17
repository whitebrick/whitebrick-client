export const SCHEMAS_QUERY = `query ($userEmail: String!) {
  wbSchemas(userEmail: $userEmail) {
    name
    label
  }
}`;

export const SCHEMA_TABLES_QUERY = `query ($schemaName: String!){
  wbTables(schemaName: $schemaName) {
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
