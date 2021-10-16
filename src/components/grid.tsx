import React, { useCallback, useContext, useEffect, useState } from 'react';

import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';
import { bindActionCreators } from 'redux';
import { ClientContext, useMutation } from 'graphql-hooks';
import { toaster } from 'evergreen-ui';
import {
  IServerSideGetRowsParams,
  GridReadyEvent,
  GridApi,
  GridSizeChangedEvent,
} from 'ag-grid-community';
import { connect } from 'react-redux';
import * as gql from 'gql-query-builder';
import { actions } from '../state/actions';
import ForeignKeyCellRenderer from './cell/renderers/foreignKey';
import PrimaryKeyCellRenderer from './cell/renderers/primaryKey';
import ForeignKeyEditor from './cell/editors/foreignKey';
import { ColumnItemType, SchemaItemType, TableItemType } from '../types';
import { getQueryParams } from '../utils/queryParams';
import {
  onAddColumn,
  onAddRow,
  onDeleteColumn,
  onDeleteRow,
  onEditColumn,
  onEditRow,
} from '../utils/actions';
import { REMOVE_OR_DELETE_COLUMN_MUTATION } from '../graphql/mutations/wb';
import { updateTableData } from '../utils/updateTableData';
import { checkPermission } from '../utils/checkPermission';

type GridPropsType = {
  table: TableItemType;
  views: any[];
  orderBy: string;
  limit: number;
  columns: ColumnItemType[];
  actions: any;
  offset: string;
  defaultView: string;
  schema: SchemaItemType;
  fields: [];
  gridAPI: GridApi;
  foreignKeyColumns: any;
  referencedByColumns: any;
  filters: any;
  rowData: any;
  rowCount: number;
  gridParams: any;
};

const Grid = ({
  table,
  views,
  orderBy,
  limit,
  columns,
  actions,
  offset,
  defaultView,
  schema,
  fields,
  gridAPI,
  foreignKeyColumns,
  referencedByColumns,
  filters,
  rowData,
  rowCount,
  gridParams,
}: GridPropsType) => {
  const client = useContext(ClientContext);
  const [parsedFilters, setParsedFilters] = useState({});
  const [changedValues, setChangedValues] = useState([]);
  const hasPermission = checkPermission('alter_table', table?.role?.name);

  const [removeOrDeleteColumnMutation] = useMutation(
    REMOVE_OR_DELETE_COLUMN_MUTATION,
  );

  const isValidFilter = filter => {
    return (
      filter.clause &&
      filter.condition &&
      filter.column &&
      filter.filterText !== ''
    );
  };

  const getFilterValue = (condition: string, filterText: any) => {
    if (condition.includes('like')) {
      return parseInt(filterText, 10)
        ? `%${parseInt(filterText, 10)}`
        : `%${filterText}%`;
    }
    return parseInt(filterText, 10) ? parseInt(filterText, 10) : filterText;
  };

  const parseFilters = filters => {
    const f = {};
    filters.forEach(filter => {
      if (isValidFilter(filter)) {
        if (filter.clause === '_where') {
          f[filter?.column] = {
            [filter.condition]: getFilterValue(
              filter.condition,
              filter.filterText,
            ),
          };
        } else
          f[filter.clause] = {
            [filter.column]: {
              [filter.condition]: getFilterValue(
                filter.condition,
                filter.filterText,
              ),
            },
          };
      }
    });
    return f;
  };

  const createServerSideDatasource = useCallback(() => {
    return {
      async getRows(params: IServerSideGetRowsParams) {
        actions.setGridParams(params);
        const subscription = gql.subscription({
          operation: `${schema.name}_${table.name}`,
          variables: {
            limit: params.request.endRow,
            offset: params.request.startRow,
            where: {
              value: parsedFilters,
              type: `${schema.name}_${table.name.concat('_bool_exp')}`,
            },
            order_by: {
              value: { [orderBy]: `asc` },
              type: `[${schema.name}_${table.name.concat('_order_by!')}]`,
            },
          },
          fields,
        });
        const operationAgg = gql.subscription({
          operation: `${schema.name}_${table.name.concat('_aggregate')}`,
          variables: {
            where: {
              value: parsedFilters,
              type: `${schema.name}_${table.name.concat('_bool_exp')}`,
            },
          },
          fields: [{ aggregate: ['count'] }],
        });
        if (fields.length > 0) {
          client.subscriptionClient.request(subscription).subscribe({
            next({ data }) {
              client.subscriptionClient.request(operationAgg).subscribe({
                next({ data: c }) {
                  actions.setRows(data[`${schema.name}_${table.name}`]);
                  actions.setRowCount(
                    c[`${schema.name}_${table.name}_aggregate`].aggregate.count,
                  );
                  params.successCallback(
                    data[`${schema.name}_${table.name}`],
                    c[`${schema.name}_${table.name}_aggregate`].aggregate.count,
                  );
                  if (
                    c[`${schema.name}_${table.name}_aggregate`].aggregate
                      .count === 0
                  )
                    params.api.showNoRowsOverlay();
                  else params.api.hideOverlay();
                },
                error(error) {
                  console.error(error);
                },
              });
            },
            error(error) {
              console.error(error);
              params.failCallback();
            },
          });
        } else {
          params.successCallback([], 0);
          params.api.showNoRowsOverlay();
        }
        params.columnApi.autoSizeAllColumns(false);
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedFilters, fields]);

  const onGridReady = (params: GridReadyEvent) => {
    actions.setGridAPI(params.api);
    actions.setColumnAPI(params.columnApi);
    if (views.length <= 0) {
      const viewObj = {
        name: 'Default View',
        state: params.columnApi.getColumnState(),
        orderBy,
        limit,
        offset,
      };
      actions.setView(viewObj);
    } else {
      const view = views.filter(view => view.name === defaultView)[0];
      params.columnApi.applyColumnState({
        state: view.state,
        applyOrder: true,
      });
    }
  };

  useEffect(() => {
    const datasource = createServerSideDatasource();
    if (gridAPI) gridAPI.setServerSideDatasource(datasource);
  }, [
    createServerSideDatasource,
    gridAPI,
    columns,
    foreignKeyColumns,
    referencedByColumns,
  ]);

  useEffect(() => {
    const params = getQueryParams(window.location.search);
    const keys = Object.keys(params);
    if (keys.length > 0) {
      const queryFilters = [];
      keys.forEach(param => {
        queryFilters.push({
          clause: '_where',
          column: param,
          condition: '_eq',
          filterText: params[param],
        });
      });
      actions.setFilters([...queryFilters]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const pf = parseFilters(filters);
    if (JSON.stringify(pf) !== JSON.stringify(parsedFilters))
      setParsedFilters(pf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const onGridSizeChanged = (params: GridSizeChangedEvent) =>
    params.columnApi.autoSizeAllColumns(false);

  const valueGetter = (params, tableName, column, type) => {
    if (tableName) {
      if (type === 'referencedBy') {
        const values = [];
        const paramsData = params.data[`arr_${table.name}_${tableName}`];

        if (paramsData) {
          paramsData.forEach(data => {
            let value = data?.[column.name];
            if (value && value.toString().length > 20)
              value = value.toString().substring(0, 20).concat('...');
            values.push(value);
          });
        }

        return Array.from(new Set(values)).join('; ').substring(0, 100);
      }
      return params.data[`obj_${table.name}_${tableName}`]?.[column.name];
    }
    return params.data[column.name];
  };

  const rowActions = params => {
    return [
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
        action: () =>
          onDeleteRow(
            params,
            schema,
            table,
            client,
            rowData,
            rowCount,
            actions,
          ),
      },
      'separator',
    ];
  };

  const columnActions = params => {
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
    ];
  };

  const tableActions = (hasPermission, params, onlyCols = false) => {
    const options = [];
    if (hasPermission) {
      if (onlyCols) options.push(...columnActions(params));
      else options.push(...rowActions(params), ...columnActions(params));
    }
    return options;
  };

  const getContextMenuItems = params => {
    actions.setFormData({});
    return tableActions(hasPermission, params).concat([
      'copy',
      'copyWithHeaders',
      hasPermission && 'paste',
      'export',
    ]);
  };

  const getMainMenuItems = params => {
    actions.setFormData({});
    return tableActions(hasPermission, params, true).concat([
      'autoSizeThis',
      'autoSizeAll',
      'separator',
      'resetColumns',
    ]);
  };

  const getColumnType = (name: string) => {
    const col = columns.filter(col => col.name === name)[0];
    return col.type;
  };

  const getRequiredColumns = () => {
    const names = [];
    columns
      .filter(col => col.isNullable === false && !col.default)
      .map(col => names.push(col.name));
    return names;
  };

  const hasRequiredCols = (variables, params) => {
    const value: any = {
      ok: false,
      data: {},
      insert: false,
      fieldsRequired: [],
    };
    const requiredCols = getRequiredColumns();
    const values = params.data;
    values[params.colDef.field] = params.newValue;
    value.ok = requiredCols.every(col => Object.keys(values).includes(col));
    value.fieldsRequired = requiredCols.filter(
      col => !Object.keys(values).includes(col),
    );
    value.data = values;
    if (!params.oldValue) value.insert = true;
    return value;
  };

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
        if (
          !key.startsWith(`obj_${table.name}`) &&
          !key.startsWith(`arr_${table.name}`) &&
          data[key]
        ) {
          variables.where[key] = {
            _eq:
              getColumnType(key) === 'integer'
                ? parseInt(data[key], 10)
                : data[key],
          };
        }
      });
      variables._set[params.colDef.field] =
        getColumnType(params.colDef.field) === 'integer'
          ? parseInt(params.newValue, 10)
          : params.newValue;
      filteredParams.forEach(param => {
        variables._set[param.colDef.field] =
          getColumnType(param.colDef.field) === 'integer'
            ? parseInt(params.newValue, 10)
            : params.newValue;
      });
      values.splice(index, 1);
      values = values.filter(el => !filteredParams.includes(el));
      setChangedValues(values);

      const rc = hasRequiredCols(variables, params);
      if (rc.ok) {
        if (rc.insert) {
          variables._set = rc.data;
          updateTableData(
            schema.name,
            table.name,
            variables,
            client,
            actions,
            true,
          );
        } else
          updateTableData(schema.name, table.name, variables, client, actions);
      } else {
        toaster.danger('Required fields are not found', {
          description: `${
            rc.fieldsRequired.length > 1
              ? `${rc.fieldsRequired.join(', ')} fields are required!`
              : `${rc.fieldsRequired.join(', ')} field is required!`
          }`,
        });
        rowData.splice(params.rowIndex, 1, rc.data);
        actions.setRows(rowData);
      }
    });
  };

  const onCellValueChanged = params => {
    const values = changedValues;
    values.push(params);
    setChangedValues(values);
    setTimeout(() => editValues(values), 500);
  };

  const renderColumn = (
    column: ColumnItemType,
    tableName: string = null,
    type: 'foreignKey' | 'referencedBy' | null = null,
  ) => {
    if (column.foreignKeys.length > 0 && type === null) {
      return (
        <AgGridColumn
          hide={false}
          field={column.name}
          key={column.name}
          headerName={column.label}
          headerTooltip={column.label}
          cellEditor="foreignKeyEditor"
          cellRenderer="foreignKeyRenderer"
          valueGetter={params => valueGetter(params, tableName, column, type)}
        />
      );
    }
    if (column.isPrimaryKey && type === null) {
      return (
        <AgGridColumn
          hide={false}
          field={column.name}
          key={column.name}
          headerName={column.label}
          headerTooltip={column.label}
          editable={params => {
            if (column?.default?.startsWith('nextval'))
              return !!valueGetter(params, tableName, column, type);
            return true;
          }}
          cellRenderer="primaryKeyRenderer"
          cellRendererParams={{ columnDefault: column.default }}
          valueGetter={params => valueGetter(params, tableName, column, type)}
        />
      );
    }
    return (
      <AgGridColumn
        initialHide={!!type}
        field={column.name}
        key={column.name}
        headerName={column.label}
        headerTooltip={column.label}
        valueGetter={params => valueGetter(params, tableName, column, type)}
        editable={!type && hasPermission}
      />
    );
  };

  return (
    <div className="mt-4">
      <AgGridReact
        frameworkComponents={{
          foreignKeyEditor: ForeignKeyEditor,
          foreignKeyRenderer: ForeignKeyCellRenderer,
          primaryKeyRenderer: PrimaryKeyCellRenderer,
        }}
        rowModelType="serverSide"
        // @ts-ignore
        serverSideStoreType="partial"
        singleClickEdit
        pagination
        paginationPageSize={limit}
        enterMovesDown
        enterMovesDownAfterEdit
        sideBar={{
          toolPanels: [
            {
              id: 'columns',
              labelDefault: 'Columns',
              labelKey: 'columns',
              iconKey: 'columns',
              toolPanel: 'agColumnsToolPanel',
              toolPanelParams: {
                suppressRowGroups: true,
                suppressValues: true,
                suppressPivotMode: true,
              },
            },
          ],
          hiddenByDefault: true,
        }}
        enableRangeSelection
        enableFillHandle
        undoRedoCellEditing
        undoRedoCellEditingLimit={20}
        defaultColDef={{
          flex: 1,
          minWidth: 100,
          editable: hasPermission,
          resizable: true,
          sortable: true,
        }}
        sortingOrder={['desc', 'asc', null]}
        onCellValueChanged={onCellValueChanged}
        domLayout="autoHeight"
        animateRows
        allowContextMenuWithControlKey
        stopEditingWhenCellsLoseFocus
        getContextMenuItems={getContextMenuItems}
        getMainMenuItems={getMainMenuItems}
        popupParent={document.querySelector('body')}
        onGridSizeChanged={onGridSizeChanged}
        onGridReady={onGridReady}>
        <AgGridColumn headerName={table.label}>
          {columns.map(column => renderColumn(column))}
        </AgGridColumn>
        {foreignKeyColumns.map(fkc => (
          <AgGridColumn headerName={fkc.tableLabel} key={fkc.tableName}>
            {fkc.cols.map(col =>
              renderColumn(col, fkc.tableName, 'foreignKey'),
            )}
          </AgGridColumn>
        ))}
        {referencedByColumns.map(rbc => (
          <AgGridColumn headerName={rbc.tableLabel} key={rbc.tableName}>
            {rbc.cols.map(col =>
              renderColumn(col, rbc.tableName, 'referencedBy'),
            )}
          </AgGridColumn>
        ))}
      </AgGridReact>
      {table.name !== '' && (
        <div className="p-4">
          <select
            value={limit}
            onChange={e => {
              actions.setLimit(Number(e.target.value));
              gridAPI.paginationSetPageSize(Number(e.target.value));
            }}>
            <option>5</option>
            <option>10</option>
            <option>20</option>
            <option>50</option>
            <option>100</option>
            <option>500</option>
          </select>{' '}
          records per page
        </div>
      )}
    </div>
  );
};

const mapStateToProps = state => ({
  table: state.table,
  tables: state.tables,
  columns: state.columns,
  orderBy: state.orderBy,
  limit: state.limit,
  views: state.views,
  current: state.current,
  offset: state.offset,
  defaultView: state.defaultView,
  schema: state.schema,
  fields: state.fields,
  gridAPI: state.gridAPI,
  foreignKeyColumns: state.foreignKeyColumns,
  referencedByColumns: state.referencedByColumns,
  filters: state.filters,
  rowData: state.rowData,
  rowCount: state.rowCount,
  gridParams: state.gridParams,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Grid);
