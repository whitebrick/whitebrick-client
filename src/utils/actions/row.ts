import * as gql from 'gql-query-builder';

export const onAddRow = actions => {
  actions.setType('newRow');
  actions.setShow(true);
};

export const onEditRow = (params, actions) => {
  actions.setType('editRow');
  actions.setParams(params.node.data);
  actions.setFormData(params.node.data);
  actions.setShow(true);
};

export const onDeleteRow = async (params, schema, table, client) => {
  const variables = { where: {} };
  const { data } = params.node;
  Object.keys(data).forEach(key => {
    if (
      !key.startsWith(`obj_${table.name}`) &&
      !key.startsWith(`arr_${table.name}`) &&
      data[key]
    ) {
      variables.where[key] = {
        _eq: parseInt(data[key], 10) ? parseInt(data[key], 10) : data[key],
      };
    }
  });

  if (Object.keys(variables.where).length > 0) {
    const operation = gql.mutation({
      operation: ''.concat('delete_', `${schema.name}_${table.name}`),
      variables: {
        where: {
          value: variables.where,
          type: `${schema.name}_${table.name}_bool_exp`,
          required: true,
        },
      },
      fields: ['affected_rows'],
    });
    await client
      .request(operation)
      .finally(() => params.api.refreshServerSideStore(params));
  }
};
