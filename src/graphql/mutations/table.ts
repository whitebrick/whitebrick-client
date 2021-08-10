export const UPDATE_TABLE_DETAILS_MUTATION = `mutation ($schemaName: String!, $tableName: String!, $newTableName: String, $newTableLabel: String){
  wbUpdateTable(schemaName: $schemaName, tableName: $tableName, newTableName: $newTableName, newTableLabel: $newTableLabel)
}`;
