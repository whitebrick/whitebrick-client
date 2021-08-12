import React, { useContext, useEffect, useState } from 'react';
import * as gql from 'gql-query-builder';
import { ClientContext } from 'graphql-hooks';
import { AgGridReact, AgGridColumn } from 'ag-grid-react';
import { ColumnItemType, SchemaItemType } from '../../types';

type SelectGridType = {
  tableName: string;
  schema: SchemaItemType;
  columns: ColumnItemType[];
  onRowClick: (row: any) => void;
};

const SelectGrid = ({
  tableName,
  schema,
  columns,
  onRowClick,
}: SelectGridType) => {
  const client = useContext(ClientContext);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchTableData = async table => {
      const fields = [];
      columns.map(column => fields.push(column.name));
      const operation = gql.query({
        operation: `${schema.name}_${table}`,
        fields,
      });
      const { data: t } = await client.request(operation);
      return t;
    };
    if (tableName && columns.length > 0) {
      fetchTableData(tableName).then(r =>
        setData(r[`${schema.name}_${tableName}`]),
      );
    }
  }, [client, columns, schema.name, tableName]);

  const onSelectionChanged = params => {
    const row = params.api.getSelectedRows();
    onRowClick(row[0]);
  };

  return (
    <div className="ag-theme-alpine">
      <AgGridReact
        defaultColDef={{
          flex: 1,
          minWidth: 100,
          editable: true,
          resizable: true,
          sortable: true,
          filter: true,
        }}
        rowSelection="single"
        sortingOrder={['desc', 'asc', null]}
        domLayout="autoHeight"
        animateRows
        onSelectionChanged={onSelectionChanged}
        popupParent={document.querySelector('body')}
        rowData={data}>
        {columns.map(column => (
          <AgGridColumn
            field={column.name}
            key={column.name}
            headerName={column.label}
          />
        ))}
      </AgGridReact>
    </div>
  );
};

export default SelectGrid;
