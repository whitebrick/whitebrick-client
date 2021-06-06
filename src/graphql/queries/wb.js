export const SCHEMAS_QUERY = `query ($userEmail: String!) {
  wbSchemas(userEmail: $userEmail) {
    name
    label
    context
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
      }
      referencedBy {
        columnName
        constraintName
        tableName
      }
    }
  }
}`;
