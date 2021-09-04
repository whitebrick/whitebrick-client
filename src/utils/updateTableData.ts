import * as gql from 'gql-query-builder';

export const updateTableData = async (
  schemaName,
  tableName,
  variables,
  client,
  actions,
) => {
  let operation;
  if (Object.keys(variables.where).length > 0) {
    operation = gql.mutation({
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
  } else {
    operation = gql.mutation({
      operation: ''.concat('insert_', `${schemaName}_${tableName}`),
      variables: {
        objects: {
          value: variables._set,
          type: `[${schemaName}_${tableName}_insert_input!]`,
          required: true,
        },
      },
      fields: ['affected_rows'],
    });
  }
  await client.request(operation).finally(() => {
    if (actions) actions.setShow(false);
  });
};
