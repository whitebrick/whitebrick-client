import React, { useContext, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import * as Yup from 'yup';
import { ClientContext } from 'graphql-hooks';
import { actions } from '../../../state/actions';
import { ColumnItemType, SchemaItemType, TableItemType } from '../../../types';
import FormMaker from '../../elements/formMaker';
import { updateTableData } from '../../../utils/updateTableData';

type RowFormPropsType = {
  columns: ColumnItemType[];
  table: TableItemType;
  schema: SchemaItemType;
  type: 'newRow' | 'editRow';
  formData: any;
  actions: any;
};

const getHint = (column: ColumnItemType) => {
  if (column.foreignKeys.length > 0)
    return `Note: This is a Foreign Key to ${column.foreignKeys[0].relTableName}`;
  if (column.isPrimaryKey) return 'Note: This is a Primary Key';
  return null;
};

const deleteForeignKeyValues = (tableName, values) => {
  const keys = values;
  Object.keys(keys).forEach(key => {
    if (
      key.startsWith(`obj_${tableName}`) ||
      key.startsWith(`arr_${tableName}`)
    )
      delete keys[key];
  });
  return keys;
};

const rowForm = (
  type: 'newRow' | 'editRow',
  table: TableItemType,
  columns: ColumnItemType[],
  formData: any = null,
) => {
  const fields = [];
  columns.forEach(column => {
    if (column.type === 'integer' || column.type === 'number')
      fields.push({
        name: column.name,
        label: column.label,
        type: 'number',
        required: column.isNotNullable,
        hint: getHint(column),
      });
    else
      fields.push({
        name: column.name,
        label: column.label,
        placeholder: `my_${column.name}`,
        type: 'text',
        required: column.isNotNullable,
        hint: getHint(column),
      });
  });
  return {
    fields,
    initialValues:
      type === 'editRow' ? deleteForeignKeyValues(table.name, formData) : {},
    validationSchema: Yup.object(),
  };
};

const getValues = (type, formData, table, columns) => {
  if (type === 'newRow')
    return {
      name: `Add new row to ${table.label}`,
      ...rowForm(type, table, columns, formData),
    };
  return {
    name: `Edit row in ${table.label}`,
    ...rowForm(type, table, columns, formData),
  };
};

const RowForm = ({
  columns,
  table,
  schema,
  type,
  formData,
  actions,
}: RowFormPropsType) => {
  const client = useContext(ClientContext);
  const [isLoading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  const value = getValues(type, formData, table, columns);

  const onSave = async values => {
    setErrors(null);
    setLoading(true);
    if (type === 'newRow') {
      const variables = { where: {}, _set: values };
      updateTableData(
        schema.name,
        table.name,
        variables,
        client,
        actions,
      ).finally(() => {
        setLoading(false);
      });
    } else {
      const variables = { where: {}, _set: {} };
      Object.keys(formData).forEach(key => {
        if (
          !key.startsWith(`obj_${table.name}`) &&
          !key.startsWith(`arr_${table.name}`) &&
          formData[key]
        ) {
          variables.where[key] = {
            _eq: parseInt(formData[key], 10)
              ? parseInt(formData[key], 10)
              : formData[key],
          };
        }
      });
      variables._set = values;
      updateTableData(
        schema.name,
        table.name,
        variables,
        client,
        actions,
      ).finally(() => {
        setLoading(false);
      });
    }
  };

  return (
    <FormMaker
      key={value.name + type}
      errors={errors}
      isLoading={isLoading}
      name={value.name}
      fields={value.fields}
      initialValues={value.initialValues}
      validationSchema={value.validationSchema}
      onSubmit={onSave}
    />
  );
};

const mapStateToProps = state => ({
  type: state.type,
  formData: state.formData,
  schema: state.schema,
  table: state.table,
  columns: state.columns,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuthenticationRequired(RowForm));
