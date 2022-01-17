import React, { useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { useFormik } from 'formik';
import { Alert, Button, PlusIcon } from 'evergreen-ui';
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
  setErrors: (value: null) => void;
  isLoading: boolean;
  actions: any;
  columnFields: any;
  columnType?: any;
};

const defaultProps = {
  columnType: null,
};

const FormMaker = ({
  name,
  show,
  fields,
  errors: formErrors,
  initialValues,
  validationSchema,
  onSubmit,
  setErrors,
  isLoading,
  actions,
  columnFields,
  columnType,
}: FormMakerPropsType) => {
  const [newFields, setNewFields] = useState(fields);
  // const [fieldCounter, setFieldCounter] = useState(1);
  const { values, errors, handleChange, handleSubmit, validateForm } =
    useFormik({
      initialValues,
      onSubmit,
      validationSchema,
      enableReinitialize: true,
      validateOnChange: false,
    });

  const handleNewFields = () => {
    const arr: any = fields.map(a => {
      return { ...a };
    });
    for (let i = 0; i < arr.length; i += 1) {
      arr[i].name = `${arr[i].name}_${columnFields}`;
    }

    setNewFields(newFields => [...newFields, ...arr]);
    actions.setColumnFields(columnFields + 1);
  };

  return (
    <SidePanel
      name={name}
      show={show}
      isLoading={isLoading}
      setShow={actions.setShow}
      values={values}
      setErrors={setErrors}
      validateForm={validateForm}
      onSave={handleSubmit}>
      <div className="w-75" style={{ position: 'relative' }}>
        {formErrors && (
          <Alert
            intent="danger"
            title={formErrors?.graphQLErrors?.[0]?.message}
            className="mb-4"
          />
        )}
        {newFields.map((field, index) => (
          <Field
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            {...field}
            values={values}
            errors={errors}
            handleChange={handleChange}
          />
        ))}
        {columnType === 'addColumn' && (
          <Button
            right={-80}
            position="absolute"
            appearance="minimal"
            iconBefore={PlusIcon}
            onClick={() => handleNewFields()}>
            Add new column
          </Button>
        )}
      </div>
    </SidePanel>
  );
};

const mapStateToProps = state => ({
  show: state.show,
  columnFields: state.columnFields,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

FormMaker.defaultProps = defaultProps;
export default connect(mapStateToProps, mapDispatchToProps)(FormMaker);
