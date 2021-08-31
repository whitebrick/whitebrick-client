import React, { useEffect, useState } from 'react';
import {
  EditIcon,
  IconButton,
  toaster,
  FilterListIcon,
  Button,
  Popover,
  PlusIcon,
} from 'evergreen-ui';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useManualQuery, useMutation } from 'graphql-hooks';
import { GridApi, ColumnApi } from 'ag-grid-community';
import { actions } from '../../state/actions';

import Grid from '../grid';
import { SAVE_TABLE_USER_SETTINGS } from '../../graphql/mutations/wb';
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
import Loading from '../loading';
import Layout from './layout';
import NotFound from '../notFound';
import FilterPane from '../common/filters/filterPane';
import Breadcrumb from '../common/breadcrumb';

type TableLayoutPropsType = {
  table: TableItemType;
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
  rowData: any;
};

const TableLayout = ({
  table,
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
  rowData,
}: TableLayoutPropsType) => {
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fetchSchemaTablesByName] = useManualQuery(SCHEMA_TABLES_QUERY);
  const [fetchSchemaTableByName] = useManualQuery(SCHEMA_TABLE_BY_NAME_QUERY);
  const [fetchSchemaByName] = useManualQuery(SCHEMA_BY_NAME_QUERY);
  const [fetchColumnsByName] = useManualQuery(COLUMNS_BY_NAME_QUERY);

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
              <Button
                onClick={() => {
                  rowData.splice(rowCount + 1, 0, {});
                  // @ts-ignore
                  gridAPI.refreshServerSideStore();
                }}
                className="mr-2"
                iconBefore={PlusIcon}>
                Add Row
              </Button>
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
          <Grid />
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
                <Breadcrumb tableLayout />
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
  rowData: state.rowData,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(TableLayout);
