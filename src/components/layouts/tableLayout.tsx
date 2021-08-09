import React, { useEffect, useState } from 'react';
import * as gql from 'gql-query-builder';
import { FaChevronRight, FaPen } from 'react-icons/fa';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions } from '../../state/actions';

import { useManualQuery, useMutation } from 'graphql-hooks';

import graphQLFetch from '../../utils/GraphQLFetch';
import Grid from '../grid';
import {
  REMOVE_OR_DELETE_COLUMN_MUTATION,
  SAVE_TABLE_USER_SETTINGS,
} from '../../graphql/mutations/wb';
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
  column: any;
  columns: Array<ColumnItemType>;
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
}: TableLayoutPropsType) => {
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
  useEffect(fetchData, []);

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
    fetchData().finally(() => actions.setShow(false));
  };

  const editValues = values => {
    values = [...Array.from(new Set(values))];
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
        if (data[key]) {
          variables.where[key] = {
            _eq: parseInt(data[key]) ? parseInt(data[key]) : data[key],
          };
        }
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
          let column = columns.filter(
            column => column.name === params.column.colId,
          )[0];
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
                        actions.setType('updateTable');
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
          </React.Fragment>
        )}
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  type: state.type,
  table: state.table,
  formData: state.formData,
  params: state.params,
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
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(TableLayout);
