import React, { useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import * as Yup from 'yup';
import { useManualQuery, useMutation } from 'graphql-hooks';
import { actions } from '../../../state/actions';
import { SchemaItemType } from '../../../types';
import FormMaker from '../../elements/formMaker';
import { parseOptions } from '../../../utils/select';
import {
  SCHEMA_TABLE_BY_NAME_QUERY,
  SCHEMA_TABLES_QUERY,
} from '../../../graphql/queries/wb';
import {
  CREATE_TABLE_MUTATION,
  UPDATE_TABLE_DETAILS_MUTATION,
} from '../../../graphql/mutations/wb';

type TableFormPropsType = {
  schemas: SchemaItemType[];
  type: 'createTable' | 'editTable';
  formData: any;
  actions: any;
};

const tableForm = (
  type: 'createTable' | 'editTable',
  schemas: SchemaItemType[],
  formData: any = null,
) => {
  return {
    fields: [
      {
        name: 'schema',
        label: 'Database Name',
        type: 'select',
        options: parseOptions(schemas),
        required: true,
        readOnly: type === 'editTable',
      },
      { name: 'name', label: 'Table Name', type: 'text', required: true },
      { name: 'label', label: 'Table Label', type: 'text', required: true },
    ],
    initialValues:
      type === 'editTable'
        ? { ...formData, schema: formData?.schema?.value }
        : { schema: formData?.schema?.value, name: '', label: '' },
    validationSchema: Yup.object().shape({
      schema: Yup.string().required(),
      name: Yup.string().required(),
      label: Yup.string().required(),
    }),
  };
};

const getValues = (type, formData, schemas) => {
  if (type === 'createTable')
    return {
      name: 'Create a new table',
      ...tableForm(type, schemas, formData),
    };
  return {
    name: `Edit ${formData.label} table`,
    ...tableForm(type, schemas, formData),
  };
};

const TableForm = ({
  schemas,
  type,
  formData,
  actions,
}: TableFormPropsType) => {
  const [isLoading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  const [fetchSchemaTables] = useManualQuery(SCHEMA_TABLES_QUERY);
  const [fetchSchemaTable] = useManualQuery(SCHEMA_TABLE_BY_NAME_QUERY);
  const [createTable] = useMutation(CREATE_TABLE_MUTATION);
  const [updateTable] = useMutation(UPDATE_TABLE_DETAILS_MUTATION);

  const value = getValues(type, formData, schemas);

  const fetchTables = async () => {
    const {
      loading: l,
      data,
      error: e,
    } = await fetchSchemaTables({
      variables: {
        schemaName: formData.schema.name,
      },
    });
    if (!l && !e) actions.setTables(data.wbMyTables);
  };

  const fetchTable = async () => {
    const { loading, data, error } = await fetchSchemaTable({
      variables: {
        schemaName: formData.schema.name,
        tableName: formData.name,
        withColumns: true,
        withSettings: true,
      },
    });
    if (!loading && !error) actions.setTable(data.wbMyTableByName);
  };

  const onSave = async values => {
    setErrors(null);
    setLoading(true);
    if (type === 'createTable') {
      const { error, loading } = await createTable({
        variables: {
          schemaName: values.schema,
          tableName: values.name,
          tableLabel: values.label,
          create: true,
        },
      });
      if (!loading) {
        setLoading(false);
        if (error) setErrors(error);
        else {
          await fetchTables();
          actions.setShow(false);
        }
      }
    } else {
      const variables: any = {
        schemaName: formData.schema.name,
        tableName: formData.name,
      };
      if (formData.name !== values.name) variables.newTableName = values.name;
      if (formData.label !== values.label)
        variables.newTableLabel = values.label;
      const { error, loading } = await updateTable({
        variables,
      });
      if (!loading) {
        setLoading(false);
        if (error) setErrors(error);
        else {
          await fetchTable();
          await fetchTables();
          actions.setShow(false);
        }
      }
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
  schemas: state.schemas,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuthenticationRequired(TableForm));
