import React, { ChangeEvent } from 'react';
import { TextInputField, SelectField } from 'evergreen-ui';

type FieldPropsType = {
  name: string;
  label: string;
  required?: boolean;
  hint?: string;
  type: 'text' | 'string' | 'integer' | 'number' | 'select';
  options?: any;
  readOnly?: boolean;
  values: any;
  errors: any;
  handleChange: (e: ChangeEvent<any>) => void;
};

const defaultProps = {
  required: false,
  readOnly: false,
  options: [],
  hint: null,
};

const Field = ({
  name,
  label,
  required,
  hint,
  type,
  options,
  readOnly,
  values,
  errors,
  handleChange,
}: FieldPropsType) => {
  if (type === 'text' || type === 'string')
    return (
      <TextInputField
        key={label}
        name={name}
        label={label}
        placeholder={`Enter ${label}`}
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
  return null;
};

Field.defaultProps = defaultProps;
export default Field;
