export const CREATE_SCHEMA_MUTATION: string = `mutation ($name: String!, $label: String!, $email: String!){
  wbCreateSchema(name: $name, label: $label, userOwnerEmail: $email){
    name
  }
}`;

export const CREATE_TABLE_MUTATION: string = `mutation ($schemaName: String!, $tableName: String!, $tableLabel: String!, $create: Boolean){
  wbAddOrCreateTable(schemaName: $schemaName, tableName: $tableName, tableLabel: $tableLabel, create: $create)
}`;

export const REMOVE_OR_DELETE_TABLE_MUTATION: string = `mutation ($schemaName: String!, $tableName: String!, $del: Boolean) {
  wbRemoveOrDeleteTable(schemaName: $schemaName, tableName: $tableName, del: $del)
}
`;

export const ADD_OR_CREATE_COLUMN_MUTATION: string = `mutation ($schemaName: String!, $tableName: String!, $create: Boolean, $columnName: String!, $columnLabel: String!, $columnType: String){
  wbAddOrCreateColumn(schemaName: $schemaName, tableName: $tableName, create: $create, columnName: $columnName, columnLabel: $columnLabel, columnType: $columnType)
}`;

export const REMOVE_OR_DELETE_COLUMN_MUTATION: string = `mutation ($schemaName: String!, $tableName: String!, $columnName: String!, $del: Boolean){
  wbRemoveOrDeleteColumn(schemaName: $schemaName, tableName: $tableName, columnName: $columnName, del: $del)
}`;

export const CREATE_OR_DELETE_PRIMARY_KEYS: string = `mutation ($schemaName: String!, $tableName: String!, $del: Boolean, $columnNames: [String]!) {
  wbCreateOrDeletePrimaryKey(schemaName: $schemaName, tableName: $tableName, del: $del, columnNames: $columnNames)
}
`;

export const CREATE_OR_ADD_FOREIGN_KEY: string = `mutation ($schemaName: String!, $tableName: String!, $columnNames: [String]!, $create: Boolean, $parentTableName: String!, $parentColumnNames: [String]!){
  wbAddOrCreateForeignKey(schemaName: $schemaName, tableName: $tableName, columnNames: $columnNames, create: $create, parentTableName: $parentTableName, parentColumnNames: $parentColumnNames)
}`;

export const REMOVE_OR_DELETE_FOREIGN_KEY: string = `mutation ($schemaName: String!, $tableName: String!, $columnNames: [String]!, $del: Boolean, $parentTableName: String!) {
  wbRemoveOrDeleteForeignKey(schemaName: $schemaName, tableName: $tableName, columnNames: $columnNames, del: $del, parentTableName: $parentTableName)
}
`;

export const UPDATE_COLUMN_MUTATION: string = `mutation ($schemaName: String!, $tableName: String!, $columnName: String!, $newColumnName: String, $newColumnLabel: String, $newType: String){
  wbUpdateColumn(schemaName: $schemaName, tableName: $tableName, columnName: $columnName, newColumnName: $newColumnName, newColumnLabel: $newColumnLabel, newType: $newType)
}`;

export const CREATE_ORGANIZATION_MUTATION: string = `mutation ($name: String!, $label: String!) {
  wbCreateOrganization(name: $name, label: $label) {
    id
  }
}
`;

export const SET_USERS_ROLE_MUTATION: string = `mutation ($organizationName: String!, $role: String!, $userEmails: [String]!) {
  wbSetOrganizationUsersRole(organizationName: $organizationName, role: $role, userEmails: $userEmails)
}
`;

export const REMOVE_USERS__MUTATION: string = `mutation ($organizationName: String!, $userEmails: [String]!) {
  wbRemoveUsersFromOrganization(organizationName: $organizationName, userEmails: $userEmails)
}
`;

export const UPDATE_ORGANIZATION_MUTATION: string = `mutation ($name: String!, $newName: String, $newLabel: String){
  wbUpdateOrganization(name: $name, newName: $newName, newLabel: $newLabel) {
    name
  }
}`;
