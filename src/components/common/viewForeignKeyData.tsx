import React, { useContext, useEffect, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import * as gql from 'gql-query-builder';
import { TextInputField, Spinner } from 'evergreen-ui';
import { ClientContext, useManualQuery } from 'graphql-hooks';
import { ColumnItemType, SchemaItemType, TableItemType } from '../../types';
import { actions } from '../../state/actions';
import SidePanel from '../elements/sidePanel';
import { SCHEMA_TABLE_BY_NAME_QUERY } from '../../graphql/queries/wb';
import { updateTableData } from '../../utils/updateTableData';

type ViewForeignKeyDataPropsType = {
  show: boolean;
  setShow: (value: boolean) => void;
  tables: TableItemType[];
  columns: ColumnItemType[];
  cellValue: string;
  column: any;
  schema: SchemaItemType;
  actions: any;
  canEdit?: boolean;
};

const defaultProps = {
  canEdit: true,
};

const ViewForeignKeyData = ({
  show,
  setShow,
  tables,
  columns,
  cellValue,
  column,
  schema,
  actions,
  canEdit,
}: ViewForeignKeyDataPropsType) => {
  const client = useContext(ClientContext);

  const [label, setLabel] = useState('');
  const [newColumns, setNewColumns] = useState([]);
  const [data, setData] = useState({});
  const [changedData, setChangedData] = useState({});
  const [relTable, setRelTable] = useState('');

  const [fetchSchemaTableByName] = useManualQuery(SCHEMA_TABLE_BY_NAME_QUERY);

  useEffect(() => {
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
    const fields = [];
    const fetchTableDataWithColumn = async (table, column) => {
      await fetchSchemaTable(table).then(t => {
        setLabel(t?.wbMyTableByName?.label);
        setNewColumns(t?.wbMyTableByName?.columns);
        t?.wbMyTableByName?.columns.map(column => fields.push(column.name));
      });
      const operation = gql.query({
        operation: `${schema.name}_${table}`,
        variables: {
          where: {
            value: {
              [column]: {
                _eq: parseInt(cellValue, 10)
                  ? parseInt(cellValue, 10)
                  : cellValue,
              },
            },
            type: `${schema.name}_${table}_bool_exp`,
          },
        },
        fields,
      });
      const fetchData = async () => client.request(operation);
      fetchData().then(({ data }) =>
        setData(data[`${schema.name}_${table}`][0]),
      );
    };
    const c = columns.filter(obj => obj.name === column.colId)[0];
    setRelTable(c?.foreignKeys[0]?.relTableName);
    fetchTableDataWithColumn(
      c?.foreignKeys[0]?.relTableName,
      c?.foreignKeys[0]?.relColumnName,
    );
  }, [
    columns,
    column,
    cellValue,
    tables,
    schema,
    client,
    fetchSchemaTableByName,
  ]);

  const onSave = () => {
    const variables = { where: {}, _set: {} };
    Object.keys(data).forEach(key => {
      variables.where[key] = {
        _eq: parseInt(data[key], 10) ? parseInt(data[key], 10) : data[key],
      };
    });
    variables._set = changedData;
    updateTableData(schema.name, relTable, variables, client, actions);
    setShow(false);
  };

  return (
    <SidePanel
      name={`Viewing data from '${label}' table`}
      show={show}
      setShow={setShow}
      renderSaveButton={canEdit}
      onSave={onSave}>
      <div className="w-75">
        {newColumns.length > 0 ? (
          newColumns.map(c => (
            <>
              {c.foreignKeys.length > 0 ? (
                <TextInputField
                  label={c.label}
                  disabled={!canEdit}
                  value={
                    changedData[c.name] ? changedData[c.name] : data[c.name]
                  }
                  onChange={e =>
                    setChangedData({ ...changedData, [c.name]: e.target.value })
                  }
                  hint={
                    c.foreignKeys.length > 0
                      ? `Note: This is a Foreign Key to ${c.foreignKeys[0].relTableName}`
                      : null
                  }
                />
              ) : (
                <TextInputField
                  label={c.label}
                  disabled={!canEdit}
                  value={
                    changedData[c.name] ? changedData[c.name] : data[c.name]
                  }
                  onChange={e =>
                    setChangedData({ ...changedData, [c.name]: e.target.value })
                  }
                  hint={c.isPrimaryKey ? 'Note: This is a Primary Key' : null}
                />
              )}
            </>
          ))
        ) : (
          <Spinner marginX="auto" marginY={120} />
        )}
      </div>
    </SidePanel>
  );
};

ViewForeignKeyData.defaultProps = defaultProps;
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
