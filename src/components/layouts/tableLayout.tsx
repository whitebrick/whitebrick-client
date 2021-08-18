import React, { useContext, useEffect, useState } from 'react';
import * as gql from 'gql-query-builder';
import { ChevronRightIcon, EditIcon, toaster } from 'evergreen-ui';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ClientContext, useManualQuery, useMutation } from 'graphql-hooks';
import { Link } from 'gatsby';
import { GridApi, ColumnApi } from 'ag-grid-community';
import { actions } from '../../state/actions';

import Grid from '../grid';
import {
  REMOVE_OR_DELETE_COLUMN_MUTATION,
  SAVE_TABLE_USER_SETTINGS,
} from '../../graphql/mutations/wb';
import { ColumnItemType, SchemaItemType, TableItemType } from '../../types';
import Seo from '../seo';

import Tabs from '../elements/tabs';
import Members from '../common/members';
import {
  SCHEMA_BY_NAME_QUERY,
  SCHEMA_TABLE_BY_NAME_QUERY,
  TABLE_USERS_QUERY,
} from '../../graphql/queries/wb';
import { updateTableData } from '../../utils/updateTableData';
import Loading from '../loading';
import Layout from './layout';
import NotFound from '../notFound';

type TableLayoutPropsType = {
  table: TableItemType;
  columns: ColumnItemType[];
  fields: [];
  rowCount: number;
  orderBy: string;
  limit: number;
  offset: number;
  views: any[];
  schema: SchemaItemType;
  defaultView: string;
  formData: any;
  actions: any;
  gridAPI: GridApi;
  columnAPI: ColumnApi;
  cloudContext: any;
  params: any;
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
  formData,
  actions,
  gridAPI,
  columnAPI,
  cloudContext,
  params,
}: TableLayoutPropsType) => {
  const client = useContext(ClientContext);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fetchSchemaTableByName] = useManualQuery(SCHEMA_TABLE_BY_NAME_QUERY);
  const [fetchSchemaByName] = useManualQuery(SCHEMA_BY_NAME_QUERY);

  const [changedValues, setChangedValues] = useState([]);
  const [removeOrDeleteColumnMutation] = useMutation(
    REMOVE_OR_DELETE_COLUMN_MUTATION,
  );
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

  useEffect(() => {
    const fetchSchema = async () => {
      const variables: any = { name: params.databaseName };
      if (params.organization) variables.organizationName = params.organization;
      const { loading, data, error } = await fetchSchemaByName({ variables });
      if (!loading) {
        if (error) setError(error);
        else actions.setSchema(data.wbMySchemaByName);
      }
    };

    const fetchSchemaTable = async () => {
      const { loading, data, error } = await fetchSchemaTableByName({
        variables: {
          schemaName: params.databaseName,
          tableName: params.tableName,
          withColumns: true,
          withSettings: true,
        },
      });
      if (!loading) {
        if (error) setError(error);
        else {
          actions.setTable(data?.wbMyTableByName);
          actions.setColumns(data?.wbMyTableByName?.columns);
          actions.setOrderBy(data?.wbMyTableByName?.columns[0]?.name);
          if (data.wbMyTableByName.settings) {
            if (
              data.wbMyTableByName.settings.views &&
              data.wbMyTableByName.settings.views.length > 0
            ) {
              actions.setViews(data.wbMyTableByName.settings.views);
            }
            if (data.wbMyTableByName.settings.defaultView)
              actions.setDefaultView(data.wbMyTableByName.settings.defaultView);
          }
        }
      }
    };
    if (params.databaseName && params.databaseName)
      fetchSchema().then(() => {
        if (params.tableName && params.tableName)
          fetchSchemaTable().finally(() => setLoading(false));
      });
    else if (params.tableName && params.tableName)
      fetchSchemaTable().finally(() => setLoading(false));
  }, [actions, fetchSchemaByName, fetchSchemaTableByName, params]);

  useEffect(fetchData, [fetchSchemaTableUsers]);

  useEffect(() => {
    actions.setOffset(0);
    actions.setCurrent(1);
  }, [table, actions]);

  const editValues = val => {
    let values = val;
    values = [...Array.from(new Set(values))];
    values.forEach((params, index) => {
      const filteredParams = values.filter(
        value => params.rowIndex === value.rowIndex,
      );
      const { data } = params;
      data[params.colDef?.field] = params.oldValue;
      filteredParams.forEach(param => {
        data[param.colDef?.field] = param.oldValue;
      });
      const variables = { where: {}, _set: {} };
      Object.keys(data).forEach(key => {
        if (data[key]) {
          variables.where[key] = {
            _eq: parseInt(data[key], 10) ? parseInt(data[key], 10) : data[key],
          };
        }
      });
      variables._set[params.colDef.field] = parseInt(params.newValue, 10)
        ? parseInt(params.newValue, 10)
        : params.newValue;
      filteredParams.forEach(param => {
        variables._set[param.colDef.field] = parseInt(param.newValue, 10)
          ? parseInt(param.newValue, 10)
          : param.newValue;
      });
      values.splice(index, 1);
      values = values.filter(el => !filteredParams.includes(el));
      setChangedValues(values);
      updateTableData(schema.name, table.name, variables, client, actions);
    });
  };

  const onCellValueChanged = params => {
    const values = changedValues;
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
      const index = views.indexOf(viewObj);
      if (index !== -1) {
        viewObj = {
          name: toView,
          state: columnAPI.getColumnState(),
          orderBy,
          limit,
          offset,
        };
        const v = views;
        v[index] = viewObj;
        actions.setViews(v);
      }
    } else {
      const viewObj = {
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

  const onAddRow = () => {
    actions.setType('newRow');
    actions.setShow(true);
  };

  const onEditRow = params => {
    actions.setType('editRow');
    actions.setParams(params.node.data);
    actions.setFormData(params.node.data);
    actions.setShow(true);
  };

  const onDeleteRow = params => {
    const variables = { where: {} };
    const { data } = params.node;
    Object.keys(data).forEach(key => {
      if (data[key]) {
        variables.where[key] = {
          _eq: parseInt(data[key], 10) ? parseInt(data[key], 10) : data[key],
        };
      }
    });
    const operation = gql.mutation({
      operation: ''.concat('delete_', `${schema.name}_${table.name}`),
      variables: {
        where: {
          value: variables.where,
          type: `${`${schema.name}_${table.name}`}_bool_exp`,
          required: true,
        },
      },
      fields: ['affected_rows'],
    });
    const fetchData = async () => client.request(operation);
    fetchData().finally(() => console.log('deleted row'));
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
      const col = columns.filter(c => c.name === colID)[0];
      const index = columns.indexOf(col);
      columns.splice(index, 1);
      fields.splice(index, 1);
      actions.setColumns(columns);
      gridAPI.refreshCells({ force: true });
    }
  };

  const getContextMenuItems = params => {
    actions.setFormData({});
    return [
      {
        name: 'Add Column',
        action: () => {
          actions.setType('addColumn');
          actions.setShow(true);
          actions.setColumn(params.column.colId);
        },
      },
      {
        name: 'Edit Column',
        action: () => {
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

  const tabs = [
    {
      title: 'Data',
      element: (
        <>
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
                actions.setType('view');
                actions.setFormData({});
                actions.setShow(true);
              }}
              aria-hidden="true"
              className="badge badge-pill badge-dark p-2"
              style={{ cursor: 'pointer' }}>
              + Create a view
            </div>
            <div className="float-right">
              <button
                type="submit"
                onClick={() => saveView(defaultView)}
                className="btn btn-sm btn-dark mr-2">
                Save to {defaultView}
              </button>
              <button
                type="submit"
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
        </>
      ),
    },
    {
      title: 'Members',
      element: <Members users={users} refetch={fetchData} name="table" />,
      noPane: true,
    },
  ];

  if (isLoading) return <Loading />;
  if (error)
    return (
      <Layout>
        <NotFound
          name={
            cloudContext.userMessages[
              error?.graphQLErrors[0].originalError.wbCode
            ][0]
          }
        />
      </Layout>
    );

  return (
    <>
      <Seo title={`${table.label} | ${schema.label}`} />
      <div className="ag-theme-alpine">
        {table.name !== '' && (
          <>
            <div className="my-3">
              <div style={{ padding: `1rem` }}>
                <p>
                  <Link to="/">Home</Link> <ChevronRightIcon />{' '}
                  <Link
                    to={
                      schema.organizationOwnerName
                        ? `/${schema.organizationOwnerName}/${schema.name}`
                        : `/db/${schema.name}`
                    }>
                    {schema.label}
                  </Link>{' '}
                  <ChevronRightIcon />
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
                    <EditIcon
                      className="ml-1"
                      aria-hidden
                      onClick={() => {
                        actions.setType('editTable');
                        actions.setFormData(table);
                        actions.setShow(true);
                      }}
                    />
                  </span>
                </h3>
                <p className="py-1">Total {rowCount} records</p>
                <Tabs items={tabs} />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

const mapStateToProps = state => ({
  type: state.type,
  table: state.table,
  formData: state.formData,
  column: state.column,
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
  cloudContext: state.cloudContext,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(TableLayout);
