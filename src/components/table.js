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

  const [fetchQueryFields] = useManualQuery(GET_TABLE_FIELDS);

  const generateQuery = ({ name, fields }) => {
    let queryFields = '';
    fields.map(field => {
      queryFields += ' '+ field.name;
    });
    return `{ ${name} { ${queryFields} } }`;
  };

  useEffect(() => {
    const handleTableChange = async () => {
      if (table !== '') {
        const { data } = await fetchQueryFields({ variables: { name: table }})
        const query = generateQuery(data['__type']);
        const fetchData = async () => await graphQLFetch({ query });
        fetchData().then(({ data }) => {
          setData(data[table]);
        });
      }
    };
    handleTableChange();
  }, [table]);

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
      {table !== '' && tableData.length > 0 ?
        <AgGridReact
          rowData={tableData}>
          {Object.keys(tableData[0]).map(key => (
            <AgGridColumn field={key} />
          ))}
        </AgGridReact>
        : <p>Please select a table to render</p>
      }
    </div>
  )
};

export default Table;
