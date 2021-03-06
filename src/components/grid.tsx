import React, { useCallback, useContext, useEffect, useState } from 'react';

import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';
import { bindActionCreators } from 'redux';
import { ClientContext, useManualQuery, useMutation } from 'graphql-hooks';
import { toaster } from 'evergreen-ui';
import {
  IServerSideGetRowsParams,
  GridReadyEvent,
  CellKeyDownEvent,
  GridApi,
  GridSizeChangedEvent,
  SortChangedEvent,
  ViewportChangedEvent,
} from 'ag-grid-community';
import { connect } from 'react-redux';
import * as gql from 'gql-query-builder';
import { actions } from '../state/actions';
import ForeignKeyCellRenderer from './cell/renderers/foreignKey';
import PrimaryKeyCellRenderer from './cell/renderers/primaryKey';
import ForeignKeyEditor from './cell/editors/foreignKey';
import {
  ColumnItemType,
  OrganizationItemType,
  SchemaItemType,
  TableItemType,
} from '../types';
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
import { SCHEMA_BY_NAME_QUERY } from '../graphql/queries/wb';

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
  organization: OrganizationItemType;
  isTableBuilding: boolean;
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
  organization,
  isTableBuilding,
}: GridPropsType) => {
  const client = useContext(ClientContext);
  const [parsedFilters, setParsedFilters] = useState({});
  const [changedValues, setChangedValues] = useState([]);
  const [isGridReady, setIsGridReady] = useState(false);
  const [enterPressed, setEnterPressed] = useState(false);
  const [newRowValues, setNewRowValues] = useState({});
  const [initRowParams, setInitRowParams] = useState({});
  const [count, setCount] = useState(0);
  const [insert, setInsert] = useState(false);
  const [sortModel, setSortModel] = useState({ colId: orderBy, sort: `asc` });
  const hasPermission = checkPermission('alter_table', table?.role?.name);

  const [fetchSchemaByName] = useManualQuery(SCHEMA_BY_NAME_QUERY);
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
              value: {
                [sortModel?.colId]: sortModel?.sort,
              },
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
                  if (data !== null && c !== null) {
                    actions.setRows(data[`${schema.name}_${table.name}`]);
                    actions.setRowCount(
                      c[`${schema.name}_${table.name}_aggregate`].aggregate
                        .count,
                    );
                    params.successCallback(
                      data[`${schema.name}_${table.name}`],
                      c[`${schema.name}_${table.name}_aggregate`].aggregate
                        .count,
                    );
                    if (
                      c[`${schema.name}_${table.name}_aggregate`].aggregate
                        .count === 0
                    )
                      params.api.showNoRowsOverlay();
                  }
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
  }, [parsedFilters, fields, sortModel]);

  const onGridReady = (params: GridReadyEvent) => {
    setIsGridReady(true);
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

  const onViewportChanged = (params: ViewportChangedEvent) => {
    const columnsToHide = [];
    const view = views.filter(view => view.name === defaultView)[0];

    // find the columns with attribute hide=true to forcefully hide them
    view?.state?.forEach(function (obj) {
      if (obj.hide === true) columnsToHide.push(obj.colId);
    });
    params.columnApi.setColumnsVisible(columnsToHide, false);
  };

  const onSortChanged = (params: SortChangedEvent) => {
    const columnState = [
      {
        colId: params.columnApi.getColumnState()[0].colId,
        sort: params.columnApi.getColumnState()[0].sort,
      },
    ];
    setSortModel(columnState.pop());
  };

  const onCellKeyDown = (params: CellKeyDownEvent) => {
    if (params.event.code === 'Enter') {
      setEnterPressed(true);
    }
  };

  useEffect(() => {
    if (enterPressed) {
      const timer = setTimeout(() => {
        if (insert) {
          const variable = {
            where: initRowParams,
            _set: newRowValues,
          };
          updateTableData(
            schema.name,
            table.name,
            variable,
            client,
            actions,
            true,
          ).finally(() => {
            setEnterPressed(false);
            setInsert(false);
            setCount(0);
          });
        } else {
          const variable = {
            where: initRowParams,
            _set: newRowValues,
          };
          updateTableData(
            schema.name,
            table.name,
            variable,
            client,
            actions,
          ).finally(() => {
            setEnterPressed(false);
            setCount(0);
          });
        }
      }, 500);
      return () => clearTimeout(timer);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enterPressed, initRowParams, newRowValues, insert, count]);

  useEffect(() => {
    const fetchSchema = async () => {
      const variables: any = { name: schema.name };
      if (organization.name) variables.organizationName = organization.name;
      const { data } = await fetchSchemaByName({ variables });
      return data.wbMySchemaByName;
    };
    if (!isTableBuilding) {
      fetchSchema().then(s => {
        if (s.status === 'Ready' && isGridReady) {
          const datasource = createServerSideDatasource();
          if (gridAPI) gridAPI.setServerSideDatasource(datasource);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    createServerSideDatasource,
    schema,
    gridAPI,
    columns,
    foreignKeyColumns,
    referencedByColumns,
    fetchSchemaByName,
    organization.name,
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
        disabled: columns.length === 0,
      },
      {
        name: 'Edit Row',
        action: () => onEditRow(params, actions),
        disabled: columns.length === 0 || rowCount === 0,
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
        disabled: rowCount === 0,
      },
      'separator',
    ];
  };

  const columnActions = params => {
    return [
      {
        name: 'Add Columns',
        action: () => onAddColumn(params, actions),
      },
      {
        name: 'Edit Column',
        action: () => onEditColumn(params, actions, columns),
        disabled: columns.length === 0,
      },
      {
        name: 'Delete Column',
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
        disabled: columns.length === 0,
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
      .filter(col => col.isNotNullable && !col.default)
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
    if (!params.oldValue) {
      if (value.ok) {
        if (params.oldValue === undefined) {
          value.insert = true;
        } else {
          value.insert = false;
        }
      } else value.insert = true;
    }
    return value;
  };

  const editValues = val => {
    let values = val;
    let arrCol = null;
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
        let dataValue = data[key];
        if (data[key] === 0 && getColumnType(key) === 'numeric')
          dataValue = true;
        if (
          !key.startsWith(`obj_${table.name}`) &&
          !key.startsWith(`arr_${table.name}`) &&
          dataValue
        ) {
          variables.where[key] = {
            _eq:
              getColumnType(key) === 'integer'
                ? parseInt(data[key], 10)
                : data[key],
          };
          if (count <= 0) {
            // Take a record of initial row data before any changed are made.
            // Using count as a trigger to allow to record only at the start of every row insertion or updation.
            setInitRowParams(variables.where);
            setCount(1);
          }
        }

        if (key.startsWith(`arr_${table.name}`)) {
          arrCol = key;
        }
      });
      variables._set[params.colDef.field] =
        // eslint-disable-next-line no-nested-ternary
        getColumnType(params.colDef.field) === 'integer'
          ? // eslint-disable-next-line no-nested-ternary
            parseInt(params.newValue, 10)
          : getColumnType(params.colDef.field) === 'numeric'
          ? parseFloat(params.newValue)
          : params.newValue;
      filteredParams.forEach(param => {
        variables._set[param.colDef.field] =
          // eslint-disable-next-line no-nested-ternary
          getColumnType(param.colDef.field) === 'integer'
            ? // eslint-disable-next-line no-nested-ternary
              parseInt(params.newValue, 10)
            : getColumnType(params.colDef.field) === 'numeric'
            ? parseFloat(params.newValue)
            : params.newValue;
      });
      values.splice(index, 1);
      values = values.filter(el => !filteredParams.includes(el));
      setChangedValues(values);

      const rc = hasRequiredCols(variables, params);
      const { field } = params.colDef;
      if (getColumnType(field) === 'integer') {
        rc.data[field] = parseInt(rc.data[field], 10);
      } else if (getColumnType(field) === 'numeric') {
        rc.data[field] = parseFloat(rc.data[field]);
      }

      if (rc.ok) {
        if (rc.insert) {
          variables._set = rc.data;
          if (arrCol !== null) delete variables._set[arrCol];
          setInsert(rc.insert);
          setNewRowValues(rc.data);
        } else {
          if (arrCol !== null) delete rc.data[arrCol];
          setNewRowValues(rc.data);
        }
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
    const Spinner =
      '<div class="ag-cell-label-container" role="presentation">' +
      '<span ref="eMenu" class="ag-header-icon ag-header-cell-menu-button" aria-hidden="true"></span>' +
      '<div ref="eLabel" class="ag-header-cell-label" role="presentation" unselectable="on">' +
      '<span ref="eText" class="ag-header-cell-text" unselectable="on"></span>' +
      '<span ref="eFilter" class="ag-header-icon ag-header-label-icon ag-filter-icon" aria-hidden="true"></span>' +
      '<span ref="eSortOrder" class="ag-header-icon ag-header-label-icon ag-sort-order" aria-hidden="true"></span>' +
      '<span ref="eSortAsc" class="ag-header-icon ag-header-label-icon ag-sort-ascending-icon" aria-hidden="true"></span>' +
      '<span ref="eSortDesc" class="ag-header-icon ag-header-label-icon ag-sort-descending-icon" aria-hidden="true"></span>' +
      '<span ref="eSortNone" class="ag-header-icon ag-header-label-icon ag-sort-none-icon" aria-hidden="true"></span>' +
      `<div class="loader" id="${column.name}"></div>` +
      '</div>' +
      '</div>';

    if (column.foreignKeys.length > 0 && type === null) {
      return (
        <AgGridColumn
          hide={false}
          field={column.name}
          key={column.name}
          headerComponentParams={{
            template: Spinner,
            enableSorting: true,
            enableMenu: true,
            displayName: `${column.label}`,
          }}
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
          headerComponentParams={{
            template: Spinner,
            enableSorting: true,
            enableMenu: true,
            displayName: `${column.label}`,
          }}
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
        headerComponentParams={{
          template: Spinner,
          enableSorting: true,
          enableMenu: true,
          displayName: `${column.label}`,
        }}
        headerTooltip={column.label}
        valueGetter={params => valueGetter(params, tableName, column, type)}
        editable={!type && hasPermission}
        singleClickEdit
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
        getContextMenuItems={getContextMenuItems}
        getMainMenuItems={getMainMenuItems}
        popupParent={document.querySelector('body')}
        onGridSizeChanged={onGridSizeChanged}
        onSortChanged={onSortChanged}
        onGridReady={onGridReady}
        onCellKeyDown={onCellKeyDown}
        onViewportChanged={onViewportChanged}>
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
  organization: state.organization,
  isTableBuilding: state.isTableBuilding,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Grid);
