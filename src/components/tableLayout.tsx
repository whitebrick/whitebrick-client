import React, { useEffect, useState } from 'react';
import * as gql from 'gql-query-builder';
import { FaChevronRight, FaPen } from 'react-icons/fa';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions } from '../state/actions/index';

import { useMutation, useSubscription } from 'graphql-hooks';

import graphQLFetch from '../utils/GraphQLFetch';
import { UPDATE_TABLE_DETAILS_MUTATION } from '../graphql/mutations/table';
import Grid from './grid';
import {
  ADD_OR_CREATE_COLUMN_MUTATION,
  CREATE_OR_ADD_FOREIGN_KEY,
  CREATE_OR_DELETE_PRIMARY_KEYS,
  REMOVE_OR_DELETE_COLUMN_MUTATION,
  REMOVE_OR_DELETE_FOREIGN_KEY,
  UPDATE_COLUMN_MUTATION,
} from '../graphql/mutations/wb';
import TableSidePanel from './TableSidePanel';
import { query } from 'gql-query-builder';

type TableLayoutPropsType = {
  table: any;
  columns: any[];
  fields: [];
  rowCount: number;
  orderBy: string;
  limit: number;
  offset: number;
  views: any[];
  schema: any;
  defaultView: string;
  fetchTables: () => any;
  formData: any;
  actions: any;
  isNewTable: boolean;
};

const TableLayout = ({
  table,
  columns,
  fields,
  rowCount,
  orderBy,
  limit,
  offset,
  views,
  schema,
  defaultView,
  fetchTables = () => {},
  formData,
  actions,
  isNewTable,
}: TableLayoutPropsType) => {
  const [gridAPI, setGridAPI] = useState(null);
  const [columnAPI, setColumnAPI] = useState(null);
  const [changedValues, setChangedValues] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [show, setShow] = useState(false);
  const [column, setColumn] = useState('');
  const [params, setParams] = useState({});
  const [updateTableMutation] = useMutation(UPDATE_TABLE_DETAILS_MUTATION);
  const [addOrCreateColumnMutation] = useMutation(
    ADD_OR_CREATE_COLUMN_MUTATION,
  );
  const [updateColumnMutation] = useMutation(UPDATE_COLUMN_MUTATION);
  const [removeOrDeleteColumnMutation] = useMutation(
    REMOVE_OR_DELETE_COLUMN_MUTATION,
  );
  const [createOrDeletePrimaryKeys] = useMutation(
    CREATE_OR_DELETE_PRIMARY_KEYS,
  );
  const [createOrAddForeignKey] = useMutation(CREATE_OR_ADD_FOREIGN_KEY);
  const [removeOrDeleteForeignKey] = useMutation(REMOVE_OR_DELETE_FOREIGN_KEY);

  const deleteForeignKey = async () => {
    const { loading, error } = await removeOrDeleteForeignKey({
      variables: {
        schemaName: schema.name,
        tableName: table.name,
        columnNames: [formData.name],
        del: true,
        parentTableName: formData['foreignKeys'][0]['relTableName'],
      },
    });
    if (!loading && !error) {
      setShow(false);
      await fetchTables();
      let column = columns.filter(column => column.name === formData.name)[0];
      actions.setFormData(column);
      gridAPI.refreshCells({ force: true });
    }
  };

  useEffect(() => {
    const handleTableChange = async () => {
      if (columns.length > 0 && !isNewTable) {
        const operation = gql.query({
          operation: schema.name + '_' + table.name,
          variables: {
            limit,
            offset,
            order_by: {
              value: { [orderBy]: `asc` },
              type: `[${schema.name + '_' + table.name.concat('_order_by!')}]`,
            },
          },
          fields,
        });
        const operationAgg = gql.query({
          operation: schema.name + '_' + table.name.concat('_aggregate'),
          fields: [{ aggregate: ['count'] }],
        });
        const fetchData = async () => await graphQLFetch(operation);
        fetchData().then(({ data }) => {
          actions.setRows(data[schema.name + '_' + table.name]);
        });
        const fetchCount = async () => await graphQLFetch(operationAgg);
        fetchCount().then(({ data }) =>
          actions.setRowCount(
            data[schema.name + '_' + table.name + '_aggregate'].aggregate.count,
          ),
        );
      }
    };
    handleTableChange().finally(() => console.log('fetched table change'));
  }, [
    schema,
    table,
    isNewTable,
    columns,
    fields,
    limit,
    offset,
    orderBy,
    actions,
  ]);

  useEffect(() => {
    actions.setOffset(0);
    actions.setCurrent(1);
  }, [table, actions]);

  const doMutation = variables => {
    const operation = gql.mutation({
      operation: ''.concat('update_', schema.name + '_' + table.name),
      variables: {
        where: {
          value: variables.where,
          type: `${schema.name + '_' + table.name}_bool_exp`,
          required: true,
        },
        _set: {
          value: variables['_set'],
          type: `${schema.name + '_' + table.name}_set_input`,
        },
      },
      fields: ['affected_rows'],
    });
    const fetchData = async () =>
      await graphQLFetch({
        query: operation.query,
        variables: operation.variables,
      });
    fetchData().finally(() => setShow(false));
  };

  const editValues = values => {
    // @ts-ignore
    values = [...new Set(values)];
    values.forEach((params, index) => {
      let filteredParams = values.filter(
        value => params.rowIndex === value.rowIndex,
      );
      let data = params.data;
      data[params.colDef?.field] = params.oldValue;
      filteredParams.forEach(param => {
        data[param.colDef?.field] = param.oldValue;
      });
      let variables = { where: {}, _set: {} };
      for (let key in data) {
        variables.where[key] = {
          _eq: parseInt(data[key]) ? parseInt(data[key]) : data[key],
        };
      }
      variables['_set'][params.colDef.field] = parseInt(params.newValue)
        ? parseInt(params.newValue)
        : params.newValue;
      filteredParams.forEach(param => {
        variables['_set'][param.colDef.field] = parseInt(param.newValue)
          ? parseInt(param.newValue)
          : param.newValue;
      });
      values.splice(index, 1);
      values = values.filter(el => !filteredParams.includes(el));
      setChangedValues(values);
      doMutation(variables);
    });
  };

  const onCellValueChanged = params => {
    let values = changedValues;
    values.push(params);
    setChangedValues(values);
    setTimeout(() => editValues(values), 500);
  };

  const saveView = (defaultView = null) => {
    if (defaultView) {
      let viewObj = views.filter(
        view =>
          view.table === schema.name + '_' + table.name &&
          view.name === defaultView,
      )[0];
      let index = views.indexOf(viewObj);
      if (index !== -1) {
        viewObj = {
          table: schema.name + '_' + table.name,
          name: defaultView,
          state: columnAPI.getColumnState(),
          orderBy,
          limit,
        };
        views[index] = viewObj;
        actions.setViews(views);
      }
    } else {
      let viewObj = {
        table: schema.name + '_' + table.name,
        name,
        state: columnAPI.getColumnState(),
        orderBy,
        limit,
      };
      actions.setView(viewObj);
      actions.setDefaultView(name);
      setName('');
    }
  };

  const getContextMenuItems = params => {
    actions.setFormData({});
    return [
      {
        name: 'Add Column',
        action: () => {
          setType('add');
          setShow(true);
          setColumn(params.column.colId);
        },
      },
      {
        name: 'Edit Column',
        action: () => {
          setType('edit');
          setShow(true);
          let column = columns.filter(
            column => column.name === params.column.colId,
          )[0];
          actions.setFormData(column);
          setColumn(params.column.colId);
        },
      },
      {
        name: 'Remove Column',
        action: () => onRemove(params.column.colId),
      },
      'separator',
      {
        name: 'Add Row',
        action: () => onAddRow(),
      },
      {
        name: 'Edit Row',
        action: () => onEditRow(params),
      },
      {
        name: 'Delete Row',
        action: () => onDeleteRow(params),
      },
      'separator',
      'copy',
      'copyWithHeaders',
      'paste',
      'export',
    ];
  };

  const onSave = async () => {
    if (type === 'newRow') {
      const operation = gql.mutation({
        operation: ''.concat('insert_', schema.name + '_' + table.name),
        variables: {
          objects: {
            value: formData,
            type: `[${schema.name + '_' + table.name}_insert_input!]`,
            required: true,
          },
        },
        fields: ['affected_rows'],
      });
      const fetchData = async () =>
        await graphQLFetch({
          query: operation.query,
          variables: operation.variables,
        });
      await fetchData();
      setShow(false);
    } else if (type === 'editRow') {
      let variables = { where: {}, _set: {} };
      for (let key in params) {
        variables.where[key] = {
          _eq: parseInt(params[key]) ? parseInt(params[key]) : params[key],
        };
      }
      variables['_set'] = formData;
      doMutation(variables);
    } else if (type === 'updateTable') {
      let variables: any = {
        schemaName: schema.name,
        tableName: table.name,
        newTableLabel: formData.label,
      };
      if (formData.name !== table.name) variables.newTableName = formData.name;
      const { loading, error } = await updateTableMutation({
        variables,
      });
      if (!error && !loading) setShow(false);
    } else if (type === 'view') {
      saveView();
      setShow(false);
    } else if (type === 'edit') {
      let variables: any = {
        schemaName: schema.name,
        tableName: table.name,
        columnName: column,
      };
      let col = columns.filter(c => c.name === column)[0];
      if (formData.name !== col.name) variables.newColumnName = formData.name;
      if (formData.label !== col.label)
        variables.newColumnLabel = formData.label;
      if (formData.type !== col.type) variables.newType = formData.type;
      await updateColumnMutation({
        variables,
      });
      if (formData.table && formData.column) {
        await createOrAddForeignKey({
          variables: {
            schemaName: schema.name,
            tableName: table.name,
            columnNames: [formData.name],
            parentTableName: formData.table,
            parentColumnNames: [formData.column],
            create: true,
          },
        });
      }
      fetchTables();
      gridAPI.refreshCells({ force: true });
      setShow(false);
    } else {
      const { loading, error } = await addOrCreateColumnMutation({
        variables: {
          schemaName: schema.name,
          tableName: table.name,
          create: true,
          columnName: formData.name,
          columnLabel: formData.label,
          columnType: formData.type,
        },
      });
      if (!loading && !error) {
        let columnNames = [];
        columns
          .filter(column => column['isPrimaryKey'] === true)
          .map(c => columnNames.push(c.name));
        if (formData['isPrimaryKey']) {
          const {
            loading: deleteLoading,
            error: deleteError,
          } = await createOrDeletePrimaryKeys({
            variables: {
              schemaName: schema.name,
              tableName: table.name,
              del: true,
              columnNames,
            },
          });
          if (!deleteLoading && !deleteError) {
            await createOrDeletePrimaryKeys({
              variables: {
                schemaName: schema.name,
                tableName: table.name,
                columnNames: [formData.name],
              },
            });
          }
        }
        if (formData.table && formData.column) {
          const { loading, error } = await createOrAddForeignKey({
            variables: {
              schemaName: schema.name,
              tableName: table.name,
              columnNames: [formData.name],
              parentTableName: formData.table,
              parentColumnNames: [formData.column],
              create: true,
            },
          });
          if (!loading && !error) {
            gridAPI.refreshCells({ force: true });
            setShow(false);
          }
        } else setShow(false);
      }
    }
  };

  const onRemove = async colID => {
    const { loading, error } = await removeOrDeleteColumnMutation({
      variables: {
        schemaName: schema.name,
        tableName: table.name,
        columnName: colID,
        del: true,
      },
    });
    if (!loading && !error) {
      let col = columns.filter(c => c.name === colID)[0];
      let index = columns.indexOf(col);
      columns.splice(index, 1);
      fields.splice(index, 1);
      actions.setColumns(columns);
      gridAPI.refreshCells({ force: true });
    }
  };

  const onAddRow = () => {
    setType('newRow');
    setShow(true);
  };

  const onEditRow = params => {
    setType('editRow');
    setParams(params.node.data);
    actions.setFormData(params.node.data);
    setShow(true);
  };

  const onDeleteRow = params => {
    let variables = { where: {} };
    let data = params.node.data;
    for (let key in data) {
      variables.where[key] = {
        _eq: parseInt(data[key]) ? parseInt(data[key]) : data[key],
      };
    }
    const operation = gql.mutation({
      operation: ''.concat('delete_', schema.name + '_' + table.name),
      variables: {
        where: {
          value: variables.where,
          type: `${schema.name + '_' + table.name}_bool_exp`,
          required: true,
        },
      },
      fields: ['affected_rows'],
    });
    const fetchData = async () =>
      await graphQLFetch({
        query: operation.query,
        variables: operation.variables,
      });
    fetchData().finally(() => console.log('deleted row'));
  };

  const subscription = gql.subscription({
    operation: schema.name + '_' + table.name,
    variables: {
      limit,
      offset,
      order_by: {
        value: { [orderBy]: `asc` },
        type: `[${schema.name + '_' + table.name.concat('_order_by!')}]`,
      },
    },
    fields,
  });

  useSubscription(subscription, ({ data, errors }) => {
    if (errors && errors.length > 0) {
      console.log(errors);
      return;
    }
    actions.setRows(data[schema.name + '_' + table.name]);
  });

  return (
    <div className="ag-theme-alpine">
      {table !== '' && (
        <React.Fragment>
          <div className="my-3">
            <div style={{ padding: `1rem` }}>
              <p>
                Databases <FaChevronRight /> {schema.label.toLowerCase()}{' '}
                <FaChevronRight /> {table.name.toLowerCase()}
              </p>
              <h3
                className="m-0 w-25"
                aria-hidden={true}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setType('updateTable');
                  actions.setFormData(table);
                  setShow(true);
                }}>
                <span>
                  {table.label}
                  <FaPen className="ml-1" size="15px" />
                </span>
              </h3>
              <p className="py-1">Total {rowCount} records</p>
              <div>
                {views.length > 0 &&
                  views
                    .filter(
                      view => view.table === schema.name + '_' + table.name,
                    )
                    .map(view => (
                      <div
                        onClick={() => {
                          columnAPI.applyColumnState({
                            state: view.state,
                            applyOrder: true,
                          });
                          actions.setLimit(view.limit);
                          actions.setOrderBy(view.orderBy);
                          actions.setDefaultView(view.name);
                        }}
                        aria-hidden="true"
                        className={`badge badge-pill mr-1 p-2 ${
                          defaultView === view.name
                            ? 'badge-primary'
                            : 'badge-secondary'
                        }`}
                        style={{ cursor: 'pointer' }}>
                        {view.name}
                      </div>
                    ))}
                <div
                  onClick={() => {
                    setType('view');
                    actions.setFormData({});
                    setShow(true);
                  }}
                  aria-hidden="true"
                  className="badge badge-pill badge-dark p-2"
                  style={{ cursor: 'pointer' }}>
                  + Create a view
                </div>
                <div className="float-right">
                  <div
                    onClick={() => saveView(defaultView)}
                    aria-hidden="true"
                    className="badge badge-dark p-2 mr-2"
                    style={{ cursor: 'pointer' }}>
                    Save to {defaultView}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Grid
            onCellValueChanged={onCellValueChanged}
            getContextMenuItems={getContextMenuItems}
            setColumnAPI={setColumnAPI}
            setGridAPI={setGridAPI}
          />
        </React.Fragment>
      )}
      <TableSidePanel
        show={show}
        setShow={setShow}
        column={column}
        onSave={onSave}
        type={type}
        deleteForeignKey={deleteForeignKey}
      />
    </div>
  );
};

const mapStateToProps = state => ({
  isNewTable: state.isNewTable,
  rows: state.rowData,
  table: state.table,
  formData: state.formData,
  columns: state.columns,
  fields: state.fields,
  rowCount: state.rowCount,
  orderBy: state.orderBy,
  limit: state.limit,
  offset: state.offset,
  views: state.views,
  schema: state.schema,
  defaultView: state.defaultView,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(TableLayout);
