export const AddColumn = (params, actions) => {
  actions.setType('addColumn');
  actions.setShow(true);
  actions.setColumn(params.column.colId);
};

export const EditColumn = (params, actions, columns) => {
  actions.setType('editColumn');
  actions.setShow(true);
  const column: any = columns.filter(
    column => column.name === params.column.colId,
  )[0];
  if (column.default) {
    column.autoIncrement = true;
    column.startSequenceNumber = column.default;
  }
  actions.setFormData(column);
  actions.setColumn(params.column.colId);
};

export const onRemove = async (
  colID,
  schema,
  columns,
  table,
  actions,
  fields,
  gridAPI,
  removeOrDeleteColumnMutation,
) => {
  const { loading, error } = await removeOrDeleteColumnMutation({
    variables: {
      schemaName: schema.name,
      tableName: table.name,
      columnName: colID,
      del: true,
    },
  });
  if (!loading && !error) {
    const col = columns.filter(c => c.name === colID)[0];
    const index = columns.indexOf(col);
    columns.splice(index, 1);
    fields.splice(index, 1);
    actions.setColumns(columns);
    gridAPI.refreshCells({ force: true });
  }
};
