import * as gql from 'gql-query-builder';

export const updateTableData = (
  schemaName,
  tableName,
  variables,
  client,
  actions,
) => {
  const operation = gql.mutation({
    operation: ''.concat('update_', `${schemaName}_${tableName}`),
    variables: {
      where: {
        value: variables.where,
        type: `${schemaName}_${tableName}_bool_exp`,
        required: true,
      },
      _set: {
        value: variables._set,
        type: `${schemaName}_${tableName}_set_input`,
      },
    },
    fields: ['affected_rows'],
  });
  client.request(operation).finally(() => {
    if (actions) actions.setShow(false);
  });
};
