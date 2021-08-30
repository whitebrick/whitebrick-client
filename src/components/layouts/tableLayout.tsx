import React, { useContext, useEffect, useState } from 'react';
import {
  ChevronRightIcon,
  EditIcon,
  IconButton,
  toaster,
  FilterListIcon,
  Button,
  Popover,
  Select,
} from 'evergreen-ui';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ClientContext, useManualQuery, useMutation } from 'graphql-hooks';
import { Link, navigate } from 'gatsby';
import { GridApi, ColumnApi } from 'ag-grid-community';
import { actions } from '../../state/actions';
import {
  onAddRow,
  onEditRow,
  onDeleteRow,
  onAddColumn,
  onEditColumn,
  onDeleteColumn,
} from '../../utils/actions';

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
  COLUMNS_BY_NAME_QUERY,
  SCHEMA_TABLES_QUERY,
} from '../../graphql/queries/wb';
import { updateTableData } from '../../utils/updateTableData';
import Loading from '../loading';
import Layout from './layout';
import NotFound from '../notFound';
import FilterPane from '../common/filters/filterPane';

type TableLayoutPropsType = {
  table: TableItemType;
  tables: TableItemType[];
  columns: ColumnItemType[];
  fields: [];
  rowCount: number;
  orderBy: string;
  limit: number;
  offset: number;
  views: any[];
  schema: SchemaItemType;
  schemas: SchemaItemType[];
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
  tables,
  columns,
  fields,
  rowCount,
  orderBy,
  limit,
  offset,
  views,
  schema,
  schemas,
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

  const [fetchSchemaTablesByName] = useManualQuery(SCHEMA_TABLES_QUERY);
  const [fetchSchemaTableByName] = useManualQuery(SCHEMA_TABLE_BY_NAME_QUERY);
  const [fetchSchemaByName] = useManualQuery(SCHEMA_BY_NAME_QUERY);
  const [fetchColumnsByName] = useManualQuery(COLUMNS_BY_NAME_QUERY);

  const [changedValues, setChangedValues] = useState([]);
  const [removeOrDeleteColumnMutation] = useMutation(
    REMOVE_OR_DELETE_COLUMN_MUTATION,
  );
  const [saveUserTableSettings] = useMutation(SAVE_TABLE_USER_SETTINGS);

  const [users, setUsers] = useState([]);
  const [fetchSchemaTableUsers] = useManualQuery(TABLE_USERS_QUERY);

  const fetchData = () => {
    if (
      params &&
      params.databaseName !== undefined &&
      params.tableName !== undefined
    )
      fetchSchemaTableUsers({
        variables: {
          schemaName: params.databaseName,
          tableName: params.tableName,
        },
      }).then(r => setUsers(r?.data?.wbTableUsers));
  };

  // This function is used with sort() to alphabetically arrange the elements in an
  // object.
  const compare = (a, b) => {
    if (a.label < b.label) {
      return -1;
    }
    if (a.label > b.label) {
      return 1;
    }
    return 0;
  };

  useEffect(() => {
    const getTableFields = async (columns: ColumnItemType[]) => {
      const tableFields = [];
      const foreignKeyCols = [];
      const referencedByCols = [];
      for (let i = 0; i < columns.length; i += 1) {
        tableFields.push(columns[i].name);
        // eslint-disable-next-line no-await-in-loop
        await Promise.all(
          // eslint-disable-next-line array-callback-return
          columns[i].foreignKeys.map(fkc => {
            const cols = [];
            fetchColumnsByName({
              variables: {
                schemaName: params.databaseName,
                tableName: fkc.relTableName,
              },
            }).then(r => {
              foreignKeyCols.push({
                tableName: fkc.relTableName,
                tableLabel: fkc.relTableLabel,
                cols: r.data.wbColumns,
              });
              r.data.wbColumns.forEach(col => cols.push(col.name));
              tableFields.push({
                [`obj_${params.tableName}_${fkc.relTableName}`]: cols,
              });
            });
          }),
        );
        // eslint-disable-next-line no-await-in-loop
        await Promise.all(
          // eslint-disable-next-line array-callback-return
          columns[i].referencedBy.map(rbc => {
            const cols = [];
            fetchColumnsByName({
              variables: {
                schemaName: params.databaseName,
                tableName: rbc.tableName,
              },
            }).then(r => {
              referencedByCols.push({
                tableName: rbc.tableName,
                tableLabel: rbc.tableLabel,
                cols: r.data.wbColumns,
              });
              r.data.wbColumns.forEach(col => cols.push(col.name));
              tableFields.push({
                [`arr_${params.tableName}_${rbc.tableName}`]: cols,
              });
            });
          }),
        );
      }
      actions.setForeignKeyColumns(foreignKeyCols);
      actions.setReferencedByColumns(referencedByCols);
      return tableFields;
    };

    const fetchSchemaTables = async (schemaName: string) => {
      const variables: any = { schemaName };
      const { loading, data, error } = await fetchSchemaTablesByName({
        variables,
      });
      if (!loading) {
        if (error) setError(error);
        else actions.setTables(data.wbMyTables);
      }
    };

    const fetchSchema = async () => {
      const variables: any = { name: params.databaseName };
      if (params.organization) variables.organizationName = params.organization;
      const { loading, data, error } = await fetchSchemaByName({ variables });
      if (!loading) {
        if (error) setError(error);
        else {
          actions.setSchema(data.wbMySchemaByName);
          await fetchSchemaTables(data.wbMySchemaByName.name);
        }
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
          const fields = await getTableFields(data?.wbMyTableByName?.columns);
          actions.setFields(fields);
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
    if (params && params.databaseName)
      fetchSchema().then(() => {
        if (params && params.tableName)
          fetchSchemaTable().finally(() => setLoading(false));
      });
    else if (params && params.tableName)
      fetchSchemaTable().finally(() => setLoading(false));
  }, [
    actions,
    fetchColumnsByName,
    fetchSchemaByName,
    fetchSchemaTableByName,
    fetchSchemaTablesByName,
    params,
  ]);

  useEffect(fetchData, [fetchSchemaTableUsers, params]);

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
        if (!key.startsWith(`obj_${table.name}`) && data[key]) {
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

  const getContextMenuItems = params => {
    actions.setFormData({});
    return [
      {
        name: 'Add Column',
        action: () => onAddColumn(params, actions),
      },
      {
        name: 'Edit Column',
        action: () => onEditColumn(params, actions, columns),
      },
      {
        name: 'Remove Column',
        action: () =>
          onDeleteColumn(
            params.column.colId,
            schema,
            columns,
            table,
            actions,
            fields,
            gridAPI,
            removeOrDeleteColumnMutation,
          ),
      },
      'separator',
      {
        name: 'Add Row',
        action: () => onAddRow(actions),
      },
      {
        name: 'Edit Row',
        action: () => onEditRow(params, actions),
      },
      {
        name: 'Delete Row',
        action: () => onDeleteRow(params, schema, table, client),
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
              <Popover
                bringFocusInside
                content={({ close }) => <FilterPane close={close} />}
                shouldCloseOnExternalClick={false}>
                <IconButton icon={FilterListIcon} className="mr-2" />
              </Popover>
              <Button onClick={() => saveView(defaultView)} className="mr-2">
                Save to {defaultView}
              </Button>
              <Button
                onClick={() => {
                  gridAPI.setSideBarVisible(!gridAPI.isSideBarVisible());
                  gridAPI.openToolPanel('columns');
                }}
                className="mr-2">
                Select Columns
              </Button>
            </div>
          </div>
          <div className="mt-4">
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

  // This function handles the user's wish to go to another table within the same schema
  // when prompted through the breadcrumb navigation in tableLayout.
  const changeTable = e => {
    const tableName = e.target.value;
    navigate(
      schema.organizationOwnerName
        ? `/${schema.organizationOwnerName}/${schema.name}/${tableName}`
        : `/db/${schema.name}/table/${tableName}`,
    );
  };

  // This function handles the user's trigger to go to another schema when prompted
  // through the breadcrumb navigation in tableLayout.
  const changeSchema = e => {
    const schemaName = e.target.value;
    navigate(
      schema.organizationOwnerName
        ? `/${schema.organizationOwnerName}/${schemaName}/`
        : `/db/${schemaName}/`,
    );
  };

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
                  <Select
                    onChange={event => changeSchema(event)}
                    width={150}
                    height={20}
                    value={schema.name}>
                    {schemas.map(schema => (
                      <option value={schema.name}>{schema.label}</option>
                    ))}
                  </Select>
                  <ChevronRightIcon />
                  <Select
                    onChange={event => changeTable(event)}
                    width={150}
                    height={20}
                    value={table.name}>
                    {tables?.sort(compare)?.map(table => (
                      <option value={table.name}>{table.label}</option>
                    ))}
                  </Select>
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
  tables: state.tables,
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
  schemas: state.schemas,
  defaultView: state.defaultView,
  columnAPI: state.columnAPI,
  gridAPI: state.gridAPI,
  cloudContext: state.cloudContext,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(TableLayout);
