import React, { useEffect, useState } from 'react'
import { AgGridColumn, AgGridReact } from 'ag-grid-react'
import { useManualQuery, useQuery } from 'graphql-hooks'

import graphQLFetch from '../utils/GraphQLFetch';

const TABLES_QUERY = `
{
  __schema{
    queryType{
      fields{
        name
      }
    }
  }
}
`;


const GET_TABLE_FIELDS = `query ($name: String!){
  __type(name: $name) {
    name
    fields {
      name
    }
  }
}`;

const Table = () => {
  const {loading, error, data} = useQuery(TABLES_QUERY);

  const [table, setTable] = useState('');
  const [tableData, setData] = useState([]);

  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);

  const [fetchQueryFields] = useManualQuery(GET_TABLE_FIELDS);

  const generateQuery = ({ name, fields }) => {
    let queryFields = '';
    fields.map(field => {
      queryFields += ' '+ field.name;
    });
    return `query ($limit: Int!, $offset: Int!) { ${name} (limit: $limit, offset: $offset) { ${queryFields} } }`;
  };

  useEffect(() => {
    const handleTableChange = async () => {
      if (table !== '') {
        const { data } = await fetchQueryFields({ variables: { name: table }})
        const query = generateQuery(data['__type']);
        const fetchData = async () => await graphQLFetch({ query, variables: { limit, offset } });
        fetchData().then(({ data }) => {
          setData(data[table]);
        });
      }
    };
    handleTableChange();
  }, [table, limit, offset]);

  if (loading) return 'Loading...'
  if (error) return 'Something Bad Happened'

  return (
    <div className="ag-theme-alpine" style={{ height: '100vh' }}>
      <select value={table} onChange={e => setTable(e.target.value)}>
        <option defaultChecked>Select a table</option>
        {data['__schema'].queryType.fields.map(field => (
          <option value={field.name}>{field.name}</option>
        ))}
      </select>
      <select value={limit} onChange={e => setLimit(parseInt(e.target.value))}>
        <option>5</option>
        <option>10</option>
        <option>20</option>
        <option>50</option>
        <option>100</option>
        <option>500</option>
      </select>
      <button disabled={offset === 0} onClick={() => setOffset(offset - limit)}>Previous Page</button>
      <button onClick={() => setOffset(offset + limit)}>Next Page</button>
      {table !== '' && tableData.length > 0 ?
        <React.Fragment>
          <AgGridReact
            rowData={tableData}>
            {Object.keys(tableData[0]).map(key => (
              <AgGridColumn field={key} />
            ))}
          </AgGridReact>
        </React.Fragment>
        : <p>Please select a table to render</p>
      }
    </div>
  )
};

export default Table;
