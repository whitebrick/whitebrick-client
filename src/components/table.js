import React from 'react'
import { AgGridColumn, AgGridReact } from 'ag-grid-react'
import { useQuery } from 'graphql-hooks'

const GET_TABLE_DATA = `{
  donnasdvd_customer {
    first_name
    last_name
    active
    activebool
    address_id
    create_date
    customer_id
    email
    last_update
    store_id
  }
}
`;

const Table = () => {
  const { loading, error, data } = useQuery(GET_TABLE_DATA);

  if (loading) return 'Loading...'
  if (error) return 'Something Bad Happened'

  return (
    <div className="ag-theme-alpine" style={{ height: '100vh' }}>
      <AgGridReact
        rowData={data.donnasdvd_customer}>
        {Object.keys(data.donnasdvd_customer[0]).map(key => (
          <AgGridColumn field={key} />
        ))}
      </AgGridReact>
    </div>
  )
};

export default Table;
