import React, { useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { useMutation } from 'graphql-hooks';
import * as Yup from 'yup';
import { actions } from '../../../state/actions';
import { OrganizationItemType } from '../../../types';
import FormMaker from '../../elements/formMaker';
import {
  CREATE_ORGANIZATION_MUTATION,
  UPDATE_ORGANIZATION_MUTATION,
} from '../../../graphql/mutations/wb';

type OrganizationFormPropsType = {
  type: 'createOrganization' | 'editOrganization';
  formData: OrganizationItemType;
  actions: any;
};

const organizationForm = (formData: any = null) => {
  return {
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      {
        name: 'label',
        label: 'Label',
        type: 'text',
        required: true,
      },
    ],
    initialValues: formData || { name: '', label: '' },
    validationSchema: Yup.object().shape({
      name: Yup.string().required(),
      label: Yup.string().required(),
    }),
  };
};

const getValues = (type, formData) => {
  if (type === 'createOrganization')
    return {
      name: 'Create a new organization',
      ...organizationForm(),
    };
  return {
    name: `Edit ${formData.label} organization`,
    ...organizationForm(formData),
  };
};

const OrganizationForm = ({
  type,
  formData,
  actions,
}: OrganizationFormPropsType) => {
  const value = getValues(type, formData);
  const [isLoading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  const [createOrganization] = useMutation(CREATE_ORGANIZATION_MUTATION);
  const [updateOrganizationMutation] = useMutation(
    UPDATE_ORGANIZATION_MUTATION,
  );

  const onSave = async values => {
    setLoading(true);
    setErrors(null);
    if (type === 'createOrganization') {
      const { error, loading } = await createOrganization({
        variables: {
          name: values.name,
          label: values.label,
        },
      });
      if (!loading) {
        setLoading(false);
        if (error) setErrors(error);
        else actions.setShow(false);
      }
    } else {
      const variables: any = { name: formData.name };
      if (values.name !== formData.name) variables.newName = values.name;
      if (values.label !== formData.label) variables.newLabel = values.label;
      const { loading, error } = await updateOrganizationMutation({
        variables,
      });
      if (!loading) {
        setLoading(false);
        if (error) setErrors(error);
        else actions.setShow(false);
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
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuthenticationRequired(OrganizationForm));
