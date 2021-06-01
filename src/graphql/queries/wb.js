export const SCHEMAS_QUERY = `query ($userEmail: String!) {
  wbSchemas(userEmail: $userEmail) {
    name
  }
}`;

export const SCHEMA_TABLES_QUERY = `query ($schemaName: String!){
  wbTables(schemaName: $schemaName) {
    name
    label
  }
}`;
