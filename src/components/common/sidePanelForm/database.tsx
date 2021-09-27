import React, { useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import * as Yup from 'yup';
import { useManualQuery, useMutation } from 'graphql-hooks';
import { actions } from '../../../state/actions';
import { OrganizationItemType } from '../../../types';
import FormMaker from '../../elements/formMaker';
import {
  CREATE_SCHEMA_MUTATION,
  UPDATE_SCHEMA_MUTATION,
} from '../../../graphql/mutations/wb';
import { SCHEMAS_QUERY } from '../../../graphql/queries/wb';

type DatabaseFormPropsType = {
  organizations: OrganizationItemType[];
  type: 'createDatabase' | 'editDatabase';
  formData: any;
  actions: any;
};

const parseOptions = options => {
  const opts = [];
  opts.push({ key: '--', value: '--' });
  options.map(option =>
    opts.push({ key: option.label, value: option.name, ...option }),
  );
  return opts;
};

const databaseForm = (
  type: 'createDatabase' | 'editDatabase',
  organizations: OrganizationItemType[],
  formData: any = null,
) => {
  return {
    fields: [
      {
        name: 'organization',
        label: 'Organization Name',
        type: 'select',
        options: parseOptions(organizations),
      },
      { name: 'name', label: 'Name', type: 'text', required: true },
      {
        name: 'label',
        label: 'Label',
        type: 'text',
        required: true,
      },
    ],
    initialValues:
      type === 'editDatabase'
        ? { ...formData, organization: formData?.organization?.value }
        : { organization: formData?.organization?.value, name: '', label: '' },
    validationSchema: Yup.object().shape({
      name: Yup.string().required(),
      label: Yup.string().required(),
    }),
  };
};

const getValues = (type, formData, organizations) => {
  if (type === 'createDatabase')
    return {
      name: 'Create a new database',
      ...databaseForm(type, organizations, formData),
    };
  return {
    name: `Edit ${formData.label} database`,
    ...databaseForm(type, organizations, formData),
  };
};

const DatabaseForm = ({
  organizations,
  type,
  formData,
  actions,
}: DatabaseFormPropsType) => {
  const [isLoading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  const value = getValues(type, formData, organizations);

  const [fetchSchemas] = useManualQuery(SCHEMAS_QUERY);
  const [createSchema] = useMutation(CREATE_SCHEMA_MUTATION);
  const [updateSchema] = useMutation(UPDATE_SCHEMA_MUTATION);

  const fetchSchemasData = async () => {
    const { data } = await fetchSchemas();
    actions.setSchemas(data.wbMySchemas);
  };

  const onSave = async values => {
    setErrors(null);
    setLoading(true);
    if (type === 'createDatabase') {
      const variables: any = {
        name: values.name,
        label: values.label,
        create: true,
      };
      if (values.organization && values.organization !== '--')
        variables.organizationOwnerName = values.organization;
      const { error, loading } = await createSchema({ variables });
      if (!loading) {
        setLoading(false);
        if (error) setErrors(error);
        else {
          await fetchSchemasData();
          actions.setShow(false);
        }
      }
    } else {
      const variables: any = {
        name: formData.name,
      };
      if (formData.name !== values.name) variables.newSchemaName = values.name;
      if (formData.label !== values.label)
        variables.newSchemaLabel = values.label;
      if (
        formData.organization.value !== values.organization &&
        values.organization !== '--'
      )
        variables.newOrganizationOwnerName = values.organization;
      const { error, loading } = await updateSchema({ variables });
      if (!loading) {
        setLoading(false);
        if (error) setErrors(error);
        else {
          await fetchSchemasData();
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
  organizations: state.organizations,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuthenticationRequired(DatabaseForm));
