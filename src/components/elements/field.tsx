import React, { ChangeEvent, useState } from 'react';
import {
  TextInputField,
  SelectField,
  Checkbox,
  Button,
  PlusIcon,
} from 'evergreen-ui';
import { useMutation, useManualQuery } from 'graphql-hooks';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { GridApi } from 'ag-grid-community';
import { actions } from '../../state/actions';
import { ColumnItemType, SchemaItemType, TableItemType } from '../../types';
import { REMOVE_OR_DELETE_FOREIGN_KEY } from '../../graphql/mutations/wb';
import { SCHEMA_TABLE_BY_NAME_QUERY } from '../../graphql/queries/wb';
import ForeignKey from './foreignKey';

type FieldPropsType = {
  name: string;
  label: string;
  required?: boolean;
  hint?: string | null;
  type:
    | 'text'
    | 'string'
    | 'integer'
    | 'number'
    | 'select'
    | 'checkbox'
    | 'foreignKeyButton';
  placeholder: string;
  options?: any;
  readOnly?: boolean;
  render?: any;
  formData: any;
  values: any;
  errors: any;
  handleChange: (e: ChangeEvent<any>) => void;
  schema: SchemaItemType;
  table: TableItemType;
  columns: ColumnItemType[];
  gridAPI: GridApi;
  actions: any;
};

const defaultProps = {
  required: false,
  readOnly: false,
  options: [],
  hint: null,
  render: null,
};

const Field = ({
  name,
  label,
  required,
  hint,
  type,
  placeholder,
  options,
  readOnly,
  render,
  formData,
  values,
  errors,
  handleChange,
  schema,
  table,
  columns,
  gridAPI,
  actions,
}: FieldPropsType) => {
  const [fetchSchemaTable] = useManualQuery(SCHEMA_TABLE_BY_NAME_QUERY);
  const [removeOrDeleteForeignKey] = useMutation(REMOVE_OR_DELETE_FOREIGN_KEY);

  const [fkIndex, setFkIndex] = useState(null);
  const [showForeign, setShowForeign] = useState(false);

  const fetchTable = async () => {
    const { loading, data, error } = await fetchSchemaTable({
      variables: {
        schemaName: schema.name,
        tableName: table.name,
        withColumns: true,
        withSettings: true,
      },
    });
    if (!loading && !error) actions.setTable(data.wbMyTableByName);
  };

  const deleteForeignKey = async () => {
    const { loading, error } = await removeOrDeleteForeignKey({
      variables: {
        schemaName: schema.name,
        tableName: table.name,
        columnNames: [formData.name],
        del: true,
        parentTableName: formData.foreignKeys[0].relTableName,
      },
    });
    if (!loading && !error) {
      actions.setShow(false);
      await fetchTable();
      const column = columns.filter(column => column.name === formData.name)[0];
      actions.setFormData(column);
      gridAPI.refreshCells({ force: true });
    }
  };
  const renderFieldType = () => {
    if (type === 'text' || type === 'string')
      return (
        <TextInputField
          key={label}
          name={name}
          label={label}
          placeholder={placeholder}
          hint={hint}
          value={values[name]}
          onChange={handleChange}
          required={required}
          disabled={readOnly}
          isInvalid={errors[name]}
          validationMessage={errors[name]}
        />
      );
    if (type === 'integer' || type === 'number')
      return (
        <TextInputField
          key={name}
          name={name}
          label={label}
          placeholder={`Enter ${label}`}
          hint={hint}
          value={values[name]}
          onChange={handleChange}
          type="number"
          required={required}
          disabled={readOnly}
          isInvalid={errors[name]}
          validationMessage={errors[name]}
        />
      );
    if (type === 'select')
      return (
        <SelectField
          name={name}
          label={label}
          hint={hint}
          disabled={readOnly}
          value={values[name]}
          required={required}
          onChange={handleChange}>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.key}
            </option>
          ))}
        </SelectField>
      );
    if (type === 'checkbox')
      return (
        <Checkbox
          name={name}
          label={label}
          checked={values[name]}
          onChange={handleChange}
        />
      );
    if (type === 'foreignKeyButton') {
      let tablename;
      let columnname;
      let index;
      if (values?.foreignKeys?.length > 0)
        return (
          <div className="mt-4">
            <hr />
            <div className="card">
              <div className="card-body">
                <span>Table: {formData.foreignKeys[0].relTableName}</span>
                <p>Column: {formData.foreignKeys[0].relColumnName}</p>
                <button
                  type="submit"
                  className="btn btn-danger btn-block"
                  onClick={deleteForeignKey}>
                  Remove foreign key relation
                </button>
              </div>
              <div className="card-footer p-2">
                <p className="text-small">
                  Note: You can add a foreign key only once you remove this.
                </p>
              </div>
            </div>
          </div>
        );
      if (showForeign) {
        if (fkIndex === -1) {
          tablename = 'table';
          columnname = 'column';
        } else {
          tablename = `table_${fkIndex}`;
          columnname = `column_${fkIndex}`;
        }
        return (
          <ForeignKey
            tableName={tablename}
            columnName={columnname}
            handleChange={handleChange}
            values={values}
            schema={schema}
          />
        );
      }
      if (formData.displayForeignKey)
        return (
          <ForeignKey
            tableName="table"
            columnName="column"
            handleChange={handleChange}
            values={values}
            schema={schema}
          />
        );
      return (
        <div className="mt-4">
          <hr />
          <div className="d-flex align-items-center">
            <div className="container text-center rounded py-4">
              <h5 className="p-2">No foreign key relations found</h5>
              <Button
                appearance="primary"
                size="large"
                iconBefore={PlusIcon}
                onClick={() => {
                  index = name.lastIndexOf('_');
                  if (index !== -1) {
                    setFkIndex(name.substr(index + 1));
                    setShowForeign(true);
                  } else {
                    actions.setFormData({
                      ...formData,
                    });
                    setFkIndex(-1);
                    setShowForeign(true);
                  }
                }}>
                Create Foreign Key
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderPage = () => {
    if (render) {
      if (
        render.type === 'comparison' &&
        values[render?.variable] === render.equalsTo
      )
        return renderFieldType();
      if (render.type === 'boolean' && render.value) return renderFieldType();
      return null;
    }
    return renderFieldType();
  };

  return renderPage();
};

Field.defaultProps = defaultProps;
const mapStateToProps = state => ({
  formData: state.formData,
  schema: state.schema,
  table: state.table,
  columns: state.columns,
  gridAPI: state.gridAPI,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Field);
