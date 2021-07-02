import React from 'react';

import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';
import Pagination from 'rc-pagination';
import { bindActionCreators } from 'redux';

import { connect } from 'react-redux';
import { actions } from '../state/actions';
import ForeignKeyCellRenderer from './ForeignKeyCellRenderer';

type GridPropsType = {
  onCellValueChanged: (params: any) => void;
  getContextMenuItems: any;
  setColumnAPI: (value: any) => void;
  setGridAPI: (value: any) => void;
  rows: any[];
  table: any;
  schema: any;
  views: any[];
  orderBy: string;
  limit: number;
  columns: any[];
  actions: any;
  rowCount: number;
  current: number;
};

const Grid = ({
  onCellValueChanged,
  getContextMenuItems,
  setColumnAPI,
  setGridAPI,
  rows,
  table,
  schema,
  views,
  orderBy,
  limit,
  columns,
  actions,
  rowCount,
  current,
}: GridPropsType) => {
  const handlePagination = (current, pageSize) => {
    actions.setOffset(Math.ceil((current - 1) * pageSize));
    actions.setCurrent(current);
  };

  return (
    <React.Fragment>
      <AgGridReact
        frameworkComponents={{
          foreignKeyRenderer: ForeignKeyCellRenderer,
        }}
        rowData={rows}
        sideBar
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
        onGridReady={params => {
          setGridAPI(params.api);
          setColumnAPI(params.columnApi);
          if (
            views.filter(
              view =>
                view.name === 'Default View' &&
                view.table === schema.name + '_' + table.name,
            ).length <= 0
          ) {
            let viewObj = {
              table: schema.name + '_' + table.name,
              name: 'Default View',
              state: params.columnApi.getColumnState(),
              orderBy,
              limit,
            };
            actions.setView(viewObj);
          }
        }}>
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
      {table !== '' && rows.length > 0 && (
        <div className="p-4">
          <select
            value={limit}
            onBlur={e => actions.setLimit(parseInt(e.target.value))}
            onChange={e => actions.setLimit(parseInt(e.target.value))}>
            <option>5</option>
            <option>10</option>
            <option>20</option>
            <option>50</option>
            <option>100</option>
            <option>500</option>
          </select>{' '}
          records per page
          <div className="float-right">
            <Pagination
              total={rowCount}
              pageSize={limit}
              current={current}
              onChange={(current, pageSize) =>
                handlePagination(current, pageSize)
              }
            />
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  rows: state.rowData,
  table: state.table,
  tables: state.tables,
  columns: state.columns,
  orderBy: state.orderBy,
  limit: state.limit,
  views: state.views,
  schema: state.schema,
  rowCount: state.rowCount,
  current: state.current,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Grid);
