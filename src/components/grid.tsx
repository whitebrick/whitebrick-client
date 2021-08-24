import React, { useContext } from 'react';

import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';
import { bindActionCreators } from 'redux';
import { ClientContext } from 'graphql-hooks';

import {
  IServerSideGetRowsParams,
  GridReadyEvent,
  GridApi,
  GetContextMenuItems,
  GridSizeChangedEvent,
} from 'ag-grid-community';
import { connect } from 'react-redux';
import * as gql from 'gql-query-builder';
import { actions } from '../state/actions';
import ForeignKeyCellRenderer from './cell/foreignKeyCellRenderer';
import PrimaryKeyCellRenderer from './cell/primaryKeyCellRenderer';
import ForeignKeyEditor from './cell/foreignKeyEditor';
import { ColumnItemType, SchemaItemType, TableItemType } from '../types';

type GridPropsType = {
  onCellValueChanged: (params: any) => void;
  getContextMenuItems: GetContextMenuItems;
  table: TableItemType;
  views: any[];
  orderBy: string;
  limit: number;
  columns: Array<ColumnItemType>;
  actions: any;
  offset: string;
  defaultView: string;
  schema: SchemaItemType;
  fields: [];
  gridAPI: GridApi;
  foreignKeyColumns: any;
  referencedByColumns: any;
};

const Grid = ({
  onCellValueChanged,
  getContextMenuItems,
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
}: GridPropsType) => {
  const client = useContext(ClientContext);

  const autoSizeColumns = (columnAPI, gridAPI) => {
    const allColumnIds = [];
    columnAPI.getAllColumns().forEach(function ids(column) {
      allColumnIds.push(column.colId);
    });
    if (allColumnIds.length > 4) columnAPI.autoSizeColumns(allColumnIds, false);
    else gridAPI.sizeColumnsToFit();
  };

  const createServerSideDatasource = () => {
    return {
      async getRows(params: IServerSideGetRowsParams) {
        const subscription = gql.subscription({
          operation: `${schema.name}_${table.name}`,
          variables: {
            limit: params.request.endRow,
            offset: params.request.startRow,
            order_by: {
              value: { [orderBy]: `asc` },
              type: `[${schema.name}_${table.name.concat('_order_by!')}]`,
            },
          },
          fields,
        });
        const operationAgg = gql.query({
          operation: `${schema.name}_${table.name.concat('_aggregate')}`,
          fields: [{ aggregate: ['count'] }],
        });
        const { data: c } = await client.request(operationAgg);
        if (c && c[`${schema.name}_${table.name}_aggregate`]) {
          actions.setRowCount(
            c[`${schema.name}_${table.name}_aggregate`].aggregate.count,
          );
          client.subscriptionClient.request(subscription).subscribe({
            next({ data }) {
              params.successCallback(
                data[`${schema.name}_${table.name}`],
                c[`${schema.name}_${table.name}_aggregate`].aggregate.count,
              );
              autoSizeColumns(params.columnApi, params.api);
            },
            error(error) {
              console.error(error);
              params.failCallback();
            },
          });
        } else {
          columns.push({
            default: '',
            referencedBy: undefined,
            type: 'string',
            name: 'welcome',
            label: 'Welcome',
            foreignKeys: [],
            isPrimaryKey: false,
          });
        }
      },
    };
  };

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
    setTimeout(function setDatasource() {
      const datasource = createServerSideDatasource();
      params.api.setServerSideDatasource(datasource);
    }, 1000);
  };

  const onGridSizeChanged = (params: GridSizeChangedEvent) =>
    autoSizeColumns(params.columnApi, params.api);

  const valueGetter = (params, tableName, column, type) => {
    if (tableName) {
      if (type === 'referencedBy') {
        const values = [];
        const paramsData = params.data[`arr_${table.name}_${tableName}`];

        if (paramsData) {
          paramsData.forEach(data => {
            let value = data?.[column.name];
            if (value.toString().length > 20)
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

  const renderColumn = (
    column: ColumnItemType,
    tableName: string = null,
    type: 'foreignKey' | 'referencedBy' | null = null,
  ) => {
    if (column.foreignKeys.length > 0) {
      return (
        <AgGridColumn
          field={column.name}
          key={column.name}
          headerName={column.label}
          headerTooltip={column.label}
          cellEditor="foreignKeyEditor"
          cellRenderer="foreignKeyRenderer"
          valueGetter={params => valueGetter(params, tableName, column, type)}
          editable={!!tableName}
        />
      );
    }
    if (column.isPrimaryKey) {
      return (
        <AgGridColumn
          field={column.name}
          key={column.name}
          headerName={column.label}
          headerTooltip={column.label}
          cellRenderer="primaryKeyRenderer"
          valueGetter={params => valueGetter(params, tableName, column, type)}
          editable={!!tableName}
        />
      );
    }
    return (
      <AgGridColumn
        field={column.name}
        key={column.name}
        headerName={column.label}
        headerTooltip={column.label}
        valueGetter={params => valueGetter(params, tableName, column, type)}
        editable={!!tableName}
      />
    );
  };

  return (
    <>
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
          editable: true,
          resizable: true,
          sortable: true,
          filter: true,
        }}
        sortingOrder={['desc', 'asc', null]}
        onCellValueChanged={onCellValueChanged}
        domLayout="autoHeight"
        animateRows
        allowContextMenuWithControlKey
        getContextMenuItems={getContextMenuItems}
        popupParent={document.querySelector('body')}
        onGridSizeChanged={onGridSizeChanged}
        onGridReady={onGridReady}>
        <AgGridColumn headerName={table.label}>
          {columns.map(column => renderColumn(column))}
        </AgGridColumn>
        {foreignKeyColumns.map(fkc => (
          <AgGridColumn headerName={fkc.tableLabel}>
            {fkc.cols.map(col =>
              renderColumn(col, fkc.tableName, 'foreignKey'),
            )}
          </AgGridColumn>
        ))}
        {referencedByColumns.map(rbc => (
          <AgGridColumn headerName={rbc.tableLabel}>
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
    </>
  );
};

const mapStateToProps = state => ({
  table: state.table,
  tables: state.tables,
  columns: state.columns,
  orderBy: state.orderBy,
  limit: state.limit,
  views: state.views,
  rowCount: state.rowCount,
  current: state.current,
  offset: state.offset,
  defaultView: state.defaultView,
  schema: state.schema,
  fields: state.fields,
  gridAPI: state.gridAPI,
  foreignKeyColumns: state.foreignKeyColumns,
  referencedByColumns: state.referencedByColumns,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Grid);
