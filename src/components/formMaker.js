import React from 'react';

const FormMaker = ({ fields, formData, setFormData }) => {
  const renderField = ({
    type,
    name,
    label,
    required = false,
    nested = false,
    nestedValue,
    options,
    readOnly = false,
  }) => {
    if (type === 'text' || type === 'string')
      return (
        <>
          <label htmlFor={name}>{label}</label>
          <input
            className="form-control"
            value={formData[name]}
            onChange={e => setFormData({ ...formData, [name]: e.target.value })}
            required={required}
            readOnly={readOnly}
          />
        </>
      );
    if (type === 'select') {
      if (nested) {
        return (
          <>
            <label htmlFor={name}>{label}</label>
            <select
              className="form-control"
              value={formData[name]}
              onBlur={() => {}}
              disabled={readOnly}
              onChange={e =>
                setFormData({ ...formData, [name]: e.target.value })
              }>
              {options.map(schema => (
                <option key={schema[nestedValue]} value={schema[nestedValue]}>
                  {schema[nestedValue]}
                </option>
              ))}
            </select>
          </>
        );
      } else {
        return (
          <>
            <label htmlFor={name}>{label}</label>
            <select
              className="form-control"
              value={formData[name]}
              onBlur={() => {}}
              disabled={readOnly}
              onChange={e =>
                setFormData({ ...formData, [name]: e.target.value })
              }>
              {options.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </>
        );
      }
    }
  };

  return (
    <div>
      {fields.map(field => (
        <div className="mt-3">{renderField(field)}</div>
      ))}
    </div>
  );
};

export default FormMaker;
