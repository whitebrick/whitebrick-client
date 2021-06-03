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
  }
}`;

export const TABLES_COLUMN_QUERY = `query ($schemaName: String!, $tableName: String!){
  wbColumns(schemaName: $schemaName, tableName: $tableName) {
    label
    name
    type
  }
}
`;
