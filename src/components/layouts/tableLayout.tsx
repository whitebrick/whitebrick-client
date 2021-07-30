import React, { useEffect, useState } from 'react';
import * as gql from 'gql-query-builder';
import { FaChevronRight, FaPen } from 'react-icons/fa';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions } from '../../state/actions';

import { useManualQuery, useMutation } from 'graphql-hooks';

import graphQLFetch from '../../utils/GraphQLFetch';
import { UPDATE_TABLE_DETAILS_MUTATION } from '../../graphql/mutations/table';
import Grid from '../grid';
import {
  ADD_OR_CREATE_COLUMN_MUTATION,
  CREATE_OR_ADD_FOREIGN_KEY,
  CREATE_OR_DELETE_PRIMARY_KEYS,
  REMOVE_OR_DELETE_COLUMN_MUTATION,
  REMOVE_OR_DELETE_FOREIGN_KEY,
  SAVE_TABLE_USER_SETTINGS,
  UPDATE_COLUMN_MUTATION,
} from '../../graphql/mutations/wb';
import TableSidePanel from '../common/tableSidePanel';
import { ColumnItemType, SchemaItemType, TableItemType } from '../../types';
import { Link } from 'gatsby';
import { toaster } from 'evergreen-ui';
import Seo from '../seo';

import { GridApi, ColumnApi } from 'ag-grid-community';
import Tabs from '../elements/tabs';
import Members from '../common/members';
import { TABLE_USERS_QUERY } from '../../graphql/queries/wb';

type TableLayoutPropsType = {
  table: TableItemType;
  columns: Array<ColumnItemType>;
  fields: [];
  rowCount: number;
  orderBy: string;
  limit: number;
  offset: number;
  views: any[];
  schema: SchemaItemType;
  defaultView: string;
  fetchTables: () => any;
  formData: any;
  actions: any;
  gridAPI: GridApi;
  columnAPI: ColumnApi;
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
  gridAPI,
  columnAPI,
}: TableLayoutPropsType) => {
  const [changedValues, setChangedValues] = useState([]);
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
  const [saveUserTableSettings] = useMutation(SAVE_TABLE_USER_SETTINGS);

  const [users, setUsers] = useState([]);
  const [fetchSchemaTableUsers] = useManualQuery(TABLE_USERS_QUERY, {
    variables: {
      schemaName: schema.name,
      tableName: table.name,
    },
  });

  const fetchData = () => {
    fetchSchemaTableUsers().then(r => setUsers(r?.data?.wbTableUsers));
  };
  useEffect(fetchData, []);

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

  const saveSettingsToDB = async () => {
    const { loading, error } = await saveUserTableSettings({
      variables: {
        schemaName: schema.name,
        tableName: table.name,
        settings: {
          views,
          defaultView,
        },
      },
    });
    if (!loading && !error)
      toaster.success('Saved!', {
        duration: 10,
      });
  };

  const saveView = (toView = null) => {
    if (toView) {
      let viewObj = views.filter(view => view.name === toView)[0];
      let index = views.indexOf(viewObj);
      if (index !== -1) {
        viewObj = {
          name: toView,
          state: columnAPI.getColumnState(),
          orderBy,
          limit,
          offset,
        };
        views[index] = viewObj;
        actions.setViews(views);
      }
    } else {
      let viewObj = {
        name: formData.name,
        state: columnAPI.getColumnState(),
        orderBy,
        limit,
        offset,
      };
      actions.setView(viewObj);
      actions.setDefaultView(formData.name);
    }
    saveSettingsToDB();
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

  const tabs = [
    {
      title: 'Data',
      element: (
        <React.Fragment>
          <div>
            {views.length > 0 &&
              views.map(view => (
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
              <button
                onClick={() => saveView(defaultView)}
                className="btn btn-sm btn-dark mr-2">
                Save to {defaultView}
              </button>
              <button
                onClick={() => {
                  gridAPI.setSideBarVisible(!gridAPI.isSideBarVisible());
                  gridAPI.openToolPanel('columns');
                }}
                className="btn btn-sm btn-primary mr-2">
                Select Columns
              </button>
            </div>
          </div>
          <div className="w-100 mt-4">
            <Grid
              onCellValueChanged={onCellValueChanged}
              getContextMenuItems={getContextMenuItems}
            />
          </div>
        </React.Fragment>
      ),
    },
    {
      title: 'Members',
      element: <Members users={users} refetch={fetchData} name={'table'} />,
      noPane: true,
    },
  ];

  return (
    <React.Fragment>
      <Seo title={`${table.label} | ${schema.label}`} />
      <div className="ag-theme-alpine">
        {table.name !== '' && (
          <React.Fragment>
            <div className="my-3">
              <div style={{ padding: `1rem` }}>
                <p>
                  <Link to="/">Home</Link> <FaChevronRight />{' '}
                  <Link
                    to={
                      schema.organizationOwnerName
                        ? `/${schema.organizationOwnerName}/${schema.name}`
                        : `/db/${schema.name}`
                    }>
                    {schema.label}
                  </Link>{' '}
                  <FaChevronRight />
                  <Link
                    to={
                      schema.organizationOwnerName
                        ? `/${schema.organizationOwnerName}/${schema.name}/${table.name}`
                        : `/db/${schema.name}/table/${table.name}`
                    }>
                    {table.label}
                  </Link>
                </p>
                <h3 className="m-0 w-25" style={{ cursor: 'pointer' }}>
                  <span>
                    {table.label}
                    <FaPen
                      className="ml-1"
                      size="15px"
                      aria-hidden={true}
                      onClick={() => {
                        setType('updateTable');
                        actions.setFormData(table);
                        setShow(true);
                      }}
                    />
                  </span>
                </h3>
                <p className="py-1">Total {rowCount} records</p>
                <Tabs items={tabs} />
              </div>
            </div>
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
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
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
  columnAPI: state.columnAPI,
  gridAPI: state.gridAPI,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(TableLayout);
