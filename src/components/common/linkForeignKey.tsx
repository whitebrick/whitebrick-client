import React, { useContext, useEffect, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import * as gql from 'gql-query-builder';
import { ClientContext } from 'graphql-hooks';
import { ColDef } from 'ag-grid-community';
import SelectGrid from './selectGrid';
import { ColumnItemType, SchemaItemType, TableItemType } from '../../types';
import { actions } from '../../state/actions';
import Modal from '../elements/modal';

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

  useEffect(() => {
    const c = columns.filter(obj => obj.name === column.colId)[0];
    const tableColumns = tables.filter(
      t => t.name === c.foreignKeys[0].relTableName,
    )[0].columns;
    setRelTable(c.foreignKeys[0].relTableName);
    setTableColumns(tableColumns);
  }, [tables, columns, column]);

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
    const operation = gql.mutation({
      operation: ''.concat('update_', `${schema.name}_${table.name}`),
      variables: {
        where: {
          value: variables.where,
          type: `${`${schema.name}_${table.name}`}_bool_exp`,
          required: true,
        },
        _set: {
          value: variables._set,
          type: `${`${schema.name}_${table.name}`}_set_input`,
        },
      },
      fields: ['affected_rows'],
    });
    await client.request(operation);
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
