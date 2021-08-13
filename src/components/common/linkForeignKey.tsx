import React, { useEffect, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { useManualQuery } from 'graphql-hooks';
import { ColDef } from 'ag-grid-community';
import SelectGrid from './selectGrid';
import { ColumnItemType, SchemaItemType, TableItemType } from '../../types';
import { actions } from '../../state/actions';
import Modal from '../elements/modal';
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
  updateData: (row, relData, colDef, schemaName, tableName) => any;
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
  updateData,
}: LinkForeignKey) => {
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

  const onRowClick = relData =>
    updateData(row, relData, colDef, schema.name, table.name).finally(() =>
      setShow(false),
    );

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
