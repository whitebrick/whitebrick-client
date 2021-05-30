import React from 'react';

const FormMaker = ({ fields, formData, setFormData }) => {
  const renderField = field => {
    if (field.type === 'text' || field.type === 'string')
      return (
        <>
          <label htmlFor={field.name}>{field.label}</label>
          <input
            className="form-control"
            value={formData[field.name]}
            onChange={e =>
              setFormData({ ...formData, [field.name]: e.target.value })
            }
            required={field.required}
          />
        </>
      );
    if (field.type === 'select') {
      if (field.nested) {
        return (
          <>
            <label htmlFor={field.name}>{field.label}</label>
            <select
              className="form-control"
              value={formData[field.name]}
              onBlur={() => {}}
              onChange={e =>
                setFormData({ ...formData, [field.name]: e.target.value })
              }>
              {field.options.map(schema => (
                <option key={schema[field.nestedValue]} value={schema[field.nestedValue]}>
                  {schema[field.nestedValue]}
                </option>
              ))}
            </select>
          </>
        );
      } else {
        return (
          <>
            <label htmlFor={field.name}>{field.label}</label>
            <select
              className="form-control"
              value={formData[field.name]}
              onBlur={() => {}}
              onChange={e =>
                setFormData({ ...formData, [field.name]: e.target.value })
              }>
              {field.options.map(option => (
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
