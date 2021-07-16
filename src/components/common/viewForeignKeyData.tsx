import React, { useEffect, useState } from 'react';
import SidePanel from './sidePanel';
import { bindActionCreators } from 'redux';
import { actions } from '../../state/actions';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import * as gql from 'gql-query-builder';
import graphQLFetch from '../../utils/GraphQLFetch';
import { ColumnItemType, SchemaItemType, TableItemType } from '../../types';
import { TextInputField } from 'evergreen-ui';

type ViewForeignKeyDataPropsType = {
  show: boolean;
  setShow: (value: boolean) => void;
  tables: Array<TableItemType>;
  columns: Array<ColumnItemType>;
  cellValue: string;
  column: any;
  schema: SchemaItemType;
};

const ViewForeignKeyData = ({
  show,
  setShow,
  tables,
  columns,
  cellValue,
  column,
  schema,
}: ViewForeignKeyDataPropsType) => {
  const [newColumns, setNewColumns] = useState([]);
  const [data, setData] = useState({});
  const [relTable, setRelTable] = useState('');

  useEffect(() => {
    if (tables && tables.length > 0) {
      const fetchTableDataWithColumn = (table, column) => {
        let tableColumns = tables.filter(t => t.name === table)[0].columns;
        setNewColumns(tableColumns);
        let fields = [];
        tableColumns.map(column => fields.push(column.name));
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
        fetchData().then(({ data }) => {
          setData(data[schema.name + '_' + table][0]);
        });
      };
      let c = columns.filter(obj => obj.name === column.colId)[0];
      setRelTable(c.foreignKeys[0].relTableName);
      fetchTableDataWithColumn(
        c.foreignKeys[0].relTableName,
        c.foreignKeys[0].relColumnName,
      );
    }
  }, [columns, column, cellValue, tables, schema]);

  return (
    <SidePanel
      name={`Viewing data from '${relTable}'`}
      show={show}
      setShow={setShow}
      renderSaveButton={false}>
      <div className="w-75">
        {newColumns.map(c => (
          <React.Fragment>
            {c.foreignKeys.length > 0 ? (
              <TextInputField
                label={`${c.label}: ${c.type}`}
                value={data[c.name]}
                contentEditable={false}
                hint={
                  c.foreignKeys.length > 0
                    ? `Note: This is a Foreign Key to ${c.foreignKeys[0].relTableName}`
                    : null
                }
              />
            ) : (
              <TextInputField
                label={`${c.label}: ${c.type}`}
                value={data[c.name]}
                contentEditable={false}
                hint={c.isPrimaryKey ? 'Note: This is a Primary Key' : null}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </SidePanel>
  );
};

const mapStateToProps = state => ({
  tables: state.tables,
  columns: state.columns,
  schema: state.schema,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuthenticationRequired(ViewForeignKeyData));
