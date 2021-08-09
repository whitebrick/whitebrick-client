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
} from 'ag-grid-community';
import { connect } from 'react-redux';
import { actions } from '../state/actions';
import ForeignKeyCellRenderer from './foreignKeyCellRenderer';
import { ColumnItemType, SchemaItemType, TableItemType } from '../types';
import * as gql from 'gql-query-builder';

type GridPropsType = {
  onCellValueChanged: (params: any) => void;
  getContextMenuItems: GetContextMenuItems;
  table: TableItemType;
  views: any[];
  orderBy: string;
  limit: number;
  columns: Array<ColumnItemType>;
  actions: any;
  rowCount: number;
  current: number;
  offset: string;
  defaultView: string;
  schema: SchemaItemType;
  fields: [];
  gridAPI: GridApi;
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
}: GridPropsType) => {
  const client = useContext(ClientContext);

  const autoSizeColumns = (columnAPI) => {
    const allColumnIds = [];
    columnAPI.getAllColumns().forEach(function (column) {
      allColumnIds.push(column.colId);
    });
    columnAPI.autoSizeColumns(allColumnIds, true);
  };

  const createServerSideDatasource = () => {
    return {
      getRows: async function (params: IServerSideGetRowsParams) {
        const subscription = gql.subscription({
          operation: schema.name + '_' + table.name,
          variables: {
            limit: params.request.endRow,
            offset: params.request.startRow,
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
        const { data: c } = await client.request(operationAgg);
        actions.setRowCount(
          c[schema.name + '_' + table.name + '_aggregate'].aggregate.count,
        );
        client.subscriptionClient.request(subscription).subscribe({
          next({ data }) {
            params.successCallback(
              data[schema.name + '_' + table.name],
              c[schema.name + '_' + table.name + '_aggregate'].aggregate.count,
            );
            autoSizeColumns(params.columnApi);
          },
          error(error) {
            console.error(error);
            params.failCallback();
          },
        });
      },
    };
  };

  const onGridReady = (params: GridReadyEvent) => {
    actions.setGridAPI(params.api);
    actions.setColumnAPI(params.columnApi);
    const datasource = createServerSideDatasource();
    params.api.setServerSideDatasource(datasource);
    if (views.length <= 0) {
      let viewObj = {
        name: 'Default View',
        state: params.columnApi.getColumnState(),
        orderBy,
        limit,
        offset,
      };
      actions.setView(viewObj);
    } else {
      let view = views.filter(view => view.name === defaultView)[0];
      params.columnApi.applyColumnState({
        state: view.state,
        applyOrder: true,
      });
    }
  };

  return (
    <React.Fragment>
      <AgGridReact
        frameworkComponents={{
          foreignKeyRenderer: ForeignKeyCellRenderer,
        }}
        rowModelType={'serverSide'}
        // @ts-ignore
        serverSideStoreType={'partial'}
        pagination={true}
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
        domLayout={'autoHeight'}
        animateRows={true}
        allowContextMenuWithControlKey={true}
        getContextMenuItems={getContextMenuItems}
        popupParent={document.querySelector('body')}
        onGridReady={onGridReady}>
        {columns.map(column => {
          if (column.foreignKeys.length > 0) {
            return (
              <AgGridColumn
                field={column.name}
                key={column.name}
                headerName={column.label}
                cellRenderer="foreignKeyRenderer"
              />
            );
          } else {
            return (
              <AgGridColumn
                field={column.name}
                key={column.name}
                headerName={column.label}
              />
            );
          }
        })}
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
    </React.Fragment>
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
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Grid);
