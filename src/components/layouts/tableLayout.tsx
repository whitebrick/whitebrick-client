/* eslint-disable no-await-in-loop */

import React, { useEffect, useState, useRef } from 'react';
import {
  EditIcon,
  IconButton,
  toaster,
  FilterListIcon,
  Button,
  Popover,
  PlusIcon,
  TrashIcon,
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
  COLUMNS_BY_NAME_QUERY,
  SCHEMA_TABLES_QUERY,
} from '../../graphql/queries/wb';
import Loading from '../loading';
import Layout from './layout';
import NotFound from '../notFound';
import FilterPane from '../common/filters/filterPane';
import Breadcrumb from '../common/breadcrumb';
import ViewButton from '../common/viewButton';
import { checkPermission } from '../../utils/checkPermission';
import { getSchemaValue } from '../../utils/select';

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
  gridParams: any;
  columns: ColumnItemType[];
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
  gridParams,
  columns,
}: TableLayoutPropsType) => {
  const ref = useRef(null);
  const PARTIAL_STORE_DEFAULT_LENGTH = 100;
  const DEFAULT_VIEW = 'Default View';
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tableFields, setTableFields] = useState([]);
  const [newRow, setNewRow] = useState(false);

  const [fetchSchemaTablesByName] = useManualQuery(SCHEMA_TABLES_QUERY);
  const [fetchSchemaTableByName] = useManualQuery(SCHEMA_TABLE_BY_NAME_QUERY);
  const [fetchSchemaByName] = useManualQuery(SCHEMA_BY_NAME_QUERY);
  const [fetchColumnsByName] = useManualQuery(COLUMNS_BY_NAME_QUERY);

  const [saveUserTableSettings] = useMutation(SAVE_TABLE_USER_SETTINGS);

  // permission to alter table
  const canAlter = checkPermission('alter_table', table?.role?.name);

  // permission to read and write records to table
  const hasRWPermission = checkPermission(
    'read_and_write_table_records',
    table?.role?.name,
  );

  useEffect(() => {
    const handleClickOutside = e => {
      if (ref.current && !ref.current.contains(e.target)) {
        const lastRow = rowData[rowData.length - 1];
        if (
          gridParams &&
          lastRow &&
          Object.keys(lastRow)?.length === 0 &&
          lastRow.constructor === Object
        ) {
          rowData.slice(rowCount - 1, 1);
          gridParams.successCallback([...rowData], rowCount - 1);
          actions.setRows(rowData);
          actions.setRowCount(rowCount - 1);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, gridParams]);

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

  useEffect(() => {
    fetchSchema();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns]);

  useEffect(() => {
    const getForeignKeyColumn = async fkc => {
      const cols = [];
      const foreignKeyCols = [];
      const fields = tableFields;

      const { loading, data, error } = await fetchColumnsByName({
        variables: {
          schemaName: params.databaseName,
          tableName: fkc.relTableName,
        },
      });
      if (!loading && !error) {
        foreignKeyCols.push({
          tableName: fkc.relTableName,
          tableLabel: fkc.relTableLabel,
          cols: data.wbColumns,
        });
        data.wbColumns.forEach(col => cols.push(col.name));
        fields.push({
          [`obj_${params.tableName}_${fkc.relTableName}`]: cols,
        });
      }
      setTableFields(fields);
      actions.setForeignKeyColumns(foreignKeyCols);
    };

    const getReferencedByColumn = async rbc => {
      const cols = [];
      const referencedByCols = [];
      const fields = tableFields;

      const { loading, data, error } = await fetchColumnsByName({
        variables: {
          schemaName: params.databaseName,
          tableName: rbc.tableName,
        },
      });
      if (!loading && !error) {
        referencedByCols.push({
          tableName: rbc.tableName,
          tableLabel: rbc.tableLabel,
          cols: data.wbColumns,
        });
        data.wbColumns.forEach(col => cols.push(col.name));
        fields.push({
          [`arr_${params.tableName}_${rbc.tableName}`]: cols,
        });
      }
      setTableFields(fields);
      actions.setReferencedByColumns(referencedByCols);
    };

    const getTableFields = async (columns: ColumnItemType[]) => {
      const fields = tableFields;
      for (let i = 0; i < columns.length; i += 1) {
        fields.push(columns[i].name);
        const fkPromises = columns[i].foreignKeys.map(getForeignKeyColumn);
        const rbPromises = columns[i].referencedBy.map(getReferencedByColumn);
        await Promise.all([...fkPromises, ...rbPromises]);
      }
      setTableFields(fields);
      return tableFields;
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
          actions.setViews(data.wbMyTableByName?.settings?.views || []);
          actions.setDefaultView(
            data.wbMyTableByName?.settings?.defaultView || 'Default View',
          );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    actions,
    fetchColumnsByName,
    fetchSchemaByName,
    fetchSchemaTableByName,
    fetchSchemaTablesByName,
    params,
  ]);

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

  const addRow = () => {
    rowData.push({});
    gridParams.successCallback([...rowData], rowCount + 1);
    actions.setRows(rowData);
    actions.setRowCount(rowCount + 1);
  };

  // watching for state change of rowData
  useEffect(() => {
    if (newRow === true) {
      setTimeout(function () {
        addRow();
        setNewRow(false);
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowData]);

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

  const SaveViewLabel = {
    borderTopRightRadius: '0px',
    borderBottomRightRadius: '0px',
  };

  const DeleteViewStyle = {
    borderTopLeftRadius: '0px',
    borderBottomLeftRadius: '0px',
    padding: '0px',
    width: '25px',
    minWidth: '25px',
  };

  const deleteView = (view: any) => {
    const newViews = [];
    const DEFAULT_VIEW_OBJ = [];

    // iterate through views and push all views, except the
    // one to be deleted, into newViews.
    views.forEach(function (obj) {
      if (obj.name !== view) newViews.push(obj);

      // Keep a record of default view for re-applying the columns
      // later on
      if (obj.name === DEFAULT_VIEW) DEFAULT_VIEW_OBJ.push(obj);
    });

    const updateSettingsToDB = async () => {
      const { loading, error } = await saveUserTableSettings({
        variables: {
          schemaName: schema.name,
          tableName: table.name,
          settings: {
            newViews,
            DEFAULT_VIEW,
          },
        },
      });
      if (!loading && !error)
        toaster.success('View sucessfully removed !', {
          duration: 10,
        });
    };

    updateSettingsToDB().then(() => {
      actions.setViews(newViews);

      // Update view on grid to default view and set its columns accordingly
      actions.setDefaultView(DEFAULT_VIEW);
      columnAPI.applyColumnState({
        state: DEFAULT_VIEW_OBJ[0].state,
        applyOrder: true,
      });
    });
  };

  const tabs = [
    {
      title: 'Data',
      element: (
        <>
          <div>
            {views.length > 0 &&
              views.map((view, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <ViewButton view={view} key={index} />
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
              {hasRWPermission && (
                <Button
                  onClick={() => {
                    gridAPI.paginationGoToLastPage();
                    // if rowData.length < 100, that means that partial store
                    // already has the required records. So we just add the row.

                    if (rowData.length < PARTIAL_STORE_DEFAULT_LENGTH) addRow();
                    // if not, then it will fetch the new records and we need
                    // to wait for updated rowData before adding the newRow.
                    else setNewRow(true);
                  }}
                  className="mr-2"
                  disabled={columns.length === 0}
                  iconBefore={PlusIcon}>
                  Add Row
                </Button>
              )}
              <Popover
                bringFocusInside
                content={({ close }) => <FilterPane close={close} />}
                shouldCloseOnExternalClick={false}>
                <IconButton icon={FilterListIcon} className="mr-2" />
              </Popover>
              <Button
                onClick={() => saveView(defaultView)}
                style={SaveViewLabel}>
                Save to {defaultView}
              </Button>
              <IconButton
                disabled={defaultView === DEFAULT_VIEW}
                icon={TrashIcon}
                intent="danger"
                style={DeleteViewStyle}
                className="mr-2"
                onClick={() => deleteView(defaultView)}
              />
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
      element: <Members name="table" />,
      noPane: true,
    },
  ];

  if (isLoading) return <Loading />;
  if (error) {
    return (
      <Layout>
        <NotFound
          name={
            cloudContext.userMessages[
              error?.graphQLErrors?.[0]?.originalError?.wbCode
            ][0]
          }
        />
      </Layout>
    );
  }

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
                    {canAlter && (
                      <IconButton
                        icon={EditIcon}
                        appearance="minimal"
                        onClick={() => {
                          actions.setType('editTable');
                          actions.setFormData({
                            ...table,
                            schema: getSchemaValue(schema.name),
                          });
                          actions.setShow(true);
                        }}
                      />
                    )}
                  </span>
                </h3>
                <p className="py-1">Total {rowCount} records</p>
                {schema.status === 'Ready' ? (
                  <div ref={ref}>
                    <Tabs items={tabs} />
                  </div>
                ) : (
                  <div className="h-100">
                    <div
                      className="d-flex align-items-center"
                      style={{ minHeight: '50vh' }}>
                      <div className="container text-center">
                        <h5>
                          Database is rebuilding - Please try again in a minute.
                        </h5>
                        <Button
                          appearance="primary"
                          className="mt-1"
                          onClick={fetchSchema}>
                          Reload
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
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
  gridParams: state.gridParams,
  columns: state.columns,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(TableLayout);
