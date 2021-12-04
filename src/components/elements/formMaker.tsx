import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { useFormik } from 'formik';
import { Alert } from 'evergreen-ui';
import SidePanel from './sidePanel';
import { actions } from '../../state/actions';
import Field from './field';

type FormMakerPropsType = {
  name: string;
  show: boolean;
  fields: any[];
  errors: any;
  initialValues: any;
  validationSchema: any;
  onSubmit: (values: any) => void;
  isLoading: boolean;
  actions: any;
};

const FormMaker = ({
  name,
  show,
  fields,
  errors: formErrors,
  initialValues,
  validationSchema,
  onSubmit,
  isLoading,
  actions,
}: FormMakerPropsType) => {
  const { values, errors, handleChange, handleSubmit, validateForm } =
    useFormik({
      initialValues,
      onSubmit,
      validationSchema,
      enableReinitialize: true,
      validateOnChange: false,
    });

  return (
    <SidePanel
      name={name}
      show={show}
      isLoading={isLoading}
      setShow={actions.setShow}
      values={values}
      validateForm={validateForm}
      onSave={handleSubmit}>
      <div className="w-75">
        {formErrors && (
          <Alert
            intent="danger"
            title={formErrors?.graphQLErrors?.[0]?.message}
            className="mb-4"
          />
        )}
        {fields.map((field, index) => (
          <Field
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            {...field}
            values={values}
            errors={errors}
            handleChange={handleChange}
          />
        ))}
      </div>
    </SidePanel>
  );
};

const mapStateToProps = state => ({
  show: state.show,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(FormMaker);
