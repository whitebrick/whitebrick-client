export const CREATE_SCHEMA_MUTATION = `mutation ($name: String!, $label: String!, $email: String!){
  wbCreateSchema(name: $name, label: $label, userOwnerEmail: $email){
    name
  }
}`;

export const CREATE_TABLE_MUTATION = `mutation ($schemaName: String!, $tableName: String!, $tableLabel: String!, $create: Boolean){
  wbAddOrCreateTable(schemaName: $schemaName, tableName: $tableName, tableLabel: $tableLabel, create: $create)
}`;

export const ADD_OR_CREATE_COLUMN_MUTATION = `mutation ($schemaName: String!, $tableName: String!, $create: Boolean, $columnName: String!, $columnLabel: String!, $columnType: String){
  wbAddOrCreateColumn(schemaName: $schemaName, tableName: $tableName, create: $create, columnName: $columnName, columnLabel: $columnLabel, columnType: $columnType)
}`;

export const CREATE_OR_DELETE_PRIMARY_KEYS = `mutation ($schemaName: String!, $tableName: String!, $del: Boolean, $columnNames: [String]!) {
  wbCreateOrDeletePrimaryKey(schemaName: $schemaName, tableName: $tableName, del: $del, columnNames: $columnNames)
}
`;
