import React from 'react';

import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actions } from '../actions';

const Grid = ({
  onCellValueChanged,
  getContextMenuItems,
  setColumnAPI,
  rows,
  table,
  schema,
  views,
  orderBy,
  limit,
  columns,
  actions,
}) => {
  return (
    <AgGridReact
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
        setColumnAPI(params.columnApi);
        if (
          views.filter(
            view =>
              view.name === 'Default View' &&
              view.table === schema + '_' + table.name,
          ).length <= 0
        ) {
          let viewObj = {
            table: schema + '_' + table.name,
            name: 'Default View',
            state: params.columnApi.getColumnState(),
            orderBy,
            limit,
          };
          actions.setView(viewObj);
        }
      }}>
      {columns.map(column => (
        <AgGridColumn
          field={column.name}
          key={column.name}
          headerName={column.label}
        />
      ))}
    </AgGridReact>
  );
};

const mapStateToProps = state => ({
  rows: state.rowData,
  table: state.table,
  columns: state.columns,
  orderBy: state.orderBy,
  limit: state.limit,
  views: state.views,
  schema: state.schema,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Grid);
