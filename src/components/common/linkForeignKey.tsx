import React, { useContext, useEffect, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { ClientContext, useManualQuery } from 'graphql-hooks';
import { ColDef } from 'ag-grid-community';
import SelectGrid from './selectGrid';
import { ColumnItemType, SchemaItemType, TableItemType } from '../../types';
import { actions } from '../../state/actions';
import Modal from '../elements/modal';
import { updateTableData } from '../../utils/updateTableData';
import { SCHEMA_TABLE_BY_NAME_QUERY } from '../../graphql/queries/wb';

type LinkForeignKey = {
  show: boolean;
  row: any;
  setShow: (value: boolean) => void;
  column: any;
  table: TableItemType;
  tables: TableItemType[];
  columns: ColumnItemType[];
  schema: SchemaItemType;
  colDef: ColDef;
};

const LinkForeignKey = ({
  row,
  show,
  setShow,
  column,
  columns,
  table,
  tables,
  schema,
  colDef,
}: LinkForeignKey) => {
  const client = useContext(ClientContext);
  const [relTable, setRelTable] = useState('');
  const [tableColumns, setTableColumns] = useState([]);
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
    const c = columns.filter(obj => obj.name === column.colId)[0];
    fetchSchemaTable(c.foreignKeys[0].relTableName).then(t => {
      setRelTable(c.foreignKeys[0].relTableName);
      setTableColumns(t.wbMyTableByName.columns);
    });
  }, [tables, columns, column, fetchSchemaTableByName, schema.name]);

  const updateValue = async (row, relData) => {
    const variables = { where: {}, _set: {} };
    Object.keys(row).forEach(key => {
      if (row[key]) {
        variables.where[key] = {
          _eq: parseInt(row[key], 10) ? parseInt(row[key], 10) : row[key],
        };
      }
    });
    variables._set[colDef.field] =
      relData[colDef.field.split('_').reverse()[0]];
    updateTableData(schema.name, table.name, variables, client, null);
  };

  const onRowClick = relData =>
    updateValue(row, relData).finally(() => setShow(false));

  return (
    <Modal
      isShown={show}
      setIsShown={setShow}
      title={`Select a record from ${relTable}`}
      width={1200}
      hasFooter={false}>
      <div className="mb-4">
        <SelectGrid
          tableName={relTable}
          columns={tableColumns}
          schema={schema}
          onRowClick={onRowClick}
        />
      </div>
    </Modal>
  );
};

const mapStateToProps = state => ({
  table: state.table,
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
)(withAuthenticationRequired(LinkForeignKey));
