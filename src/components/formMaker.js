import React from 'react';

const FormMaker = ({ fields, formData, setFormData }) => {
  const handleSelectChange = (multiple, name, e) => {
    if (multiple) {
      let values = Array.from(e.target.selectedOptions, option => option.value);
      setFormData({ ...formData, [name]: values });
    } else setFormData({ ...formData, [name]: e.target.value });
  };

  const renderField = ({
    type,
    name,
    label,
    required = false,
    nested = false,
    nestedValue,
    options,
    selected = null,
    readOnly = false,
    keyValuePairs = false,
    multiple = false,
    addNewOptions = false,
    addNewOptionsValue = null,
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
    else if (type === 'select') {
      if (nested) {
        return (
          <>
            <label htmlFor={name}>{label}</label>
            <select
              className="form-control"
              multiple={multiple}
              value={formData[name]}
              onBlur={() => {}}
              disabled={readOnly}
              onChange={e => handleSelectChange(multiple, name, e)}>
              {!multiple && (
                <option disabled selected={!selected}>
                  Select {name}
                </option>
              )}
              {options.map(option => (
                <option
                  key={option[nestedValue]}
                  value={option[nestedValue]}
                  selected={selected && option[selected] === true}>
                  {option[nestedValue]}
                </option>
              ))}
              {addNewOptions &&
                addNewOptionsValue.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
            </select>
          </>
        );
      } else if (keyValuePairs) {
        let res = [];
        for (let key in options) res.push({ key, value: options[key] });
        return (
          <>
            <label htmlFor={name}>{label}</label>
            <select
              className="form-control"
              multiple={multiple}
              value={formData[name]}
              onBlur={() => {}}
              disabled={readOnly}
              onChange={e => handleSelectChange(multiple, name, e)}>
              {!multiple && (
                <option disabled selected>
                  Select {name}
                </option>
              )}
              {res.map(option => (
                <option key={option.key} value={option.key}>
                  {option.value}
                </option>
              ))}
              {addNewOptions &&
                addNewOptionsValue.map(option => (
                  <option key={option} value={option}>
                    {option}
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
              multiple={multiple}
              value={formData[name]}
              onBlur={() => {}}
              disabled={readOnly}
              onChange={e => handleSelectChange(multiple, name, e)}>
              {!multiple && (
                <option disabled selected>
                  Select {name}
                </option>
              )}
              {options.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
              {addNewOptions &&
                addNewOptionsValue.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
            </select>
          </>
        );
      }
    } else if (type === 'checkbox') {
      return (
        <>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="checkbox"
              id={name}
              defaultChecked={formData[name]}
              onChange={e =>
                setFormData({ ...formData, [name]: e.target.checked })
              }
            />
            <label className="form-check-label" htmlFor={name}>
              {label}
            </label>
          </div>
        </>
      );
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
