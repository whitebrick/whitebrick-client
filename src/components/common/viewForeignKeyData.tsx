import React, { useContext, useEffect, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import * as gql from 'gql-query-builder';
import { TextInputField } from 'evergreen-ui';
import { ClientContext, useManualQuery } from 'graphql-hooks';
import { ColumnItemType, SchemaItemType, TableItemType } from '../../types';
import { actions } from '../../state/actions';
import SidePanel from '../elements/sidePanel';
import { SCHEMA_TABLE_BY_NAME_QUERY } from '../../graphql/queries/wb';

type ViewForeignKeyDataPropsType = {
  show: boolean;
  setShow: (value: boolean) => void;
  tables: TableItemType[];
  columns: ColumnItemType[];
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
  const client = useContext(ClientContext);

  const [newColumns, setNewColumns] = useState([]);
  const [data, setData] = useState({});
  const [relTable, setRelTable] = useState('');

  const [fetchSchemaTableByName] = useManualQuery(SCHEMA_TABLE_BY_NAME_QUERY);

  const fetchSchemaTable = async table => {
    const { data } = await fetchSchemaTableByName({
      variables: {
        schemaName: schema.name,
        tableName: table,
        withColumns: true,
        withSettings: true,
      },
    });
    return data;
  };

  useEffect(() => {
    if (tables && tables.length > 0) {
      const fields = [];
      const fetchTableDataWithColumn = async (table, column) => {
        await fetchSchemaTable(table).then(t => {
          setNewColumns(t.wbMyTableByName.columns);
          t.wbMyTableByName.columns.map(column => fields.push(column.name));
        });
        const operation = gql.query({
          operation: `${schema.name}_${table}`,
          variables: {
            where: {
              value: {
                [column]: {
                  _eq: parseInt(cellValue) ? parseInt(cellValue) : cellValue,
                },
              },
              type: `${`${schema.name}_${table}`}_bool_exp`,
            },
          },
          fields,
        });
        const fetchData = async () => await client.request(operation);
        fetchData().then(({ data }) =>
          setData(data[`${schema.name}_${table}`][0]),
        );
      };
      const c = columns.filter(obj => obj.name === column.colId)[0];
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
          <>
            {c.foreignKeys.length > 0 ? (
              <TextInputField
                label={`${c.label}: ${c.type}`}
                value={data[c.name]}
                contentEditable={false}
                disabled
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
                disabled
                hint={c.isPrimaryKey ? 'Note: This is a Primary Key' : null}
              />
            )}
          </>
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
