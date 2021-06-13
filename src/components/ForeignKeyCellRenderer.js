import React, { useState } from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';
import SidePanel from './sidePanel';
import * as gql from 'gql-query-builder';
import graphQLFetch from '../utils/GraphQLFetch';

const ForeignKeyCellRenderer = ({
  valueFormatted,
  value,
  column,
  columns,
  tables,
  schema,
}) => {
  const cellValue = valueFormatted ? valueFormatted : value;
  const [show, setShow] = useState(false);
  const [newColumns, setNewColumns] = useState([]);
  const [data, setData] = useState({});
  const [relTable, setRelTable] = useState('');

  const fetchTableWithColumn = (table, column) => {
    let columns = tables.filter(t => t.name === table)[0].columns;
    setNewColumns(columns);
    let fields = [];
    columns.map(column => fields.push(column.name));
    const operation = gql.query({
      operation: schema.name + '_' + table,
      variables: {
        where: {
          value: {
            [column]: {
              _eq: parseInt(cellValue) ? parseInt(cellValue) : cellValue,
            },
          },
          type: `${schema.name + '_' + table}_bool_exp`,
        },
      },
      fields,
    });
    const fetchData = async () => await graphQLFetch(operation);
    fetchData()
      .then(({ data }) => {
        setData(data[schema.name + '_' + table][0]);
      })
      .finally(() => setShow(true));
  };

  const renderView = () => {
    let c = columns.filter(obj => obj.name === column.colId)[0];
    setRelTable(c.foreignKeys[0].relTableName);
    fetchTableWithColumn(
      c.foreignKeys[0].relTableName,
      c.foreignKeys[0].relColumnName,
    );
  };

  return (
    <React.Fragment>
      <span>
        <span>{cellValue}</span>
        {cellValue && (
          <div className="float-right d-flex align-items-center">
            <button className="btn" onClick={() => renderView()}>
              <FaExternalLinkAlt size="12px" />
            </button>
          </div>
        )}
      </span>
      {show && (
        <SidePanel
          name={`Viewing data from '${relTable}'`}
          show={show}
          setShow={setShow}
          renderSaveButton={false}>
          <React.Fragment>
            {newColumns.map(c => (
              <div className="mt-3">
                <label>
                  {c.label}: <span className="text-small">{c.type}</span>
                </label>
                {c.foreignKeys.length > 0 ? (
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text bg-light">
                        <FaExternalLinkAlt />
                      </span>
                    </div>
                    <input
                      className="form-control"
                      value={data[c.name]}
                      disabled
                    />
                  </div>
                ) : (
                  <input
                    className="form-control"
                    value={data[c.name]}
                    contentEditable={false}
                    disabled
                  />
                )}
                {c.isPrimaryKey && (
                  <p className="text-small p-1">Note: This is a Primary Key</p>
                )}
                {c.foreignKeys.length > 0 && (
                  <p className="text-small p-1">
                    Note: This is a Foreign Key to `
                    {c.foreignKeys[0].relTableName}`
                  </p>
                )}
              </div>
            ))}
          </React.Fragment>
        </SidePanel>
      )}
    </React.Fragment>
  );
};

export default ForeignKeyCellRenderer;
