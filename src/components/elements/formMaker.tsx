import React from 'react';
import { bindActionCreators } from 'redux';
import { TextInputField, SelectField } from 'evergreen-ui';
import { connect } from 'react-redux';
import { actions } from '../../state/actions';
import { setOrder } from '../../utils/setOrder';

type FormMakerPropsType = {
  fields: any[];
  formData: any;
  actions: any;
};

const FormMaker = ({ fields, formData, actions }: FormMakerPropsType) => {
  const handleSelectChange = (multiple, name, e) => {
    if (multiple) {
      const values = Array.from(
        e.target.selectedOptions,
        // @ts-ignore
        option => option.value,
      );
      actions.setFormData({ ...formData, [name]: values });
    } else actions.setFormData({ ...formData, [name]: e.target.value });
  };

  const getDefaultTextValue = (value, defaultValue) => {
    if (value) return value;
    if (defaultValue) return defaultValue;
    return '';
  };

  const renderField = ({
    type,
    name,
    label,
    required = false,
    nested = false,
    nestedValue,
    nestedLabel = nestedValue,
    options,
    selected = null,
    readOnly = false,
    keyValuePairs = false,
    multiple = false,
    addNewOptions = false,
    addNewOptionsValue = null,
    onClick = null,
    defaultValue = null,
    buttonStyle = 'btn-outline-primary',
    render = true,
  }) => {
    if (render) {
      if (type === 'text' || type === 'string')
        return (
          <TextInputField
            key={label}
            label={label}
            placeholder={`Enter ${label}`}
            value={getDefaultTextValue(formData[name], defaultValue)}
            onChange={e =>
              actions.setFormData({ ...formData, [name]: e.target.value })
            }
            required={required}
            disabled={readOnly}
          />
        );
      if (type === 'number' || type === 'integer')
        return (
          <TextInputField
            key={label}
            label={label}
            placeholder={`Enter ${label}`}
            value={!formData[name] ? defaultValue : formData[name]}
            onChange={e =>
              actions.setFormData({ ...formData, [name]: e.target.value })
            }
            type="number"
            required={required}
            disabled={readOnly}
          />
        );
      if (type === 'select') {
        if (nested) {
          return (
            <SelectField
              key={label}
              label={label}
              value={
                !formData[name] ? defaultValue : formData[name][nestedValue]
              }
              required={required}
              onChange={e => handleSelectChange(multiple, name, e)}>
              {!multiple && <option disabled>Select {label}</option>}
              {options?.sort(setOrder)?.map(option => (
                <option
                  key={option[nestedValue]}
                  value={option[nestedValue]}
                  selected={selected && option[selected] === true}>
                  {option[nestedLabel]}
                </option>
              ))}
              {addNewOptions &&
                addNewOptionsValue.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
            </SelectField>
          );
        }
        if (keyValuePairs) {
          const res = [];
          Object.keys(options).forEach(key =>
            res.push({ key, value: options[key] }),
          );
          return (
            <SelectField
              label={label}
              value={!formData[name] ? defaultValue : formData[name]}
              required={required}
              onChange={e => handleSelectChange(multiple, name, e)}>
              {!multiple && (
                <option disabled selected={!selected}>
                  Select {label}
                </option>
              )}
              {res.map(option => (
                <option key={option.value} value={option.value}>
                  {option.key}
                </option>
              ))}
              {addNewOptions &&
                addNewOptionsValue.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
            </SelectField>
          );
        }
        return (
          <>
            <label htmlFor={name}>{label}</label>
            <select
              className="form-control"
              multiple={multiple}
              value={!formData[name] ? defaultValue : formData[name]}
              disabled={readOnly}
              onChange={e => handleSelectChange(multiple, name, e)}>
              {!multiple && <option disabled>Select {name}</option>}
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
      if (type === 'checkbox') {
        return (
          <div className="form-check my-2">
            <input
              className="form-check-input"
              type="checkbox"
              id={name}
              defaultChecked={formData[name]}
              onChange={e =>
                actions.setFormData({ ...formData, [name]: e.target.checked })
              }
            />
            <label className="form-check-label" htmlFor={name}>
              {label}
            </label>
          </div>
        );
      }
      if (type === 'button') {
        return (
          <button
            type="submit"
            className={`btn ${buttonStyle} btn-block mt-5`}
            onClick={onClick}>
            {label}
          </button>
        );
      }
      if (type === 'heading') {
        return (
          <div className="mt-5">
            <hr />
            <h5>{label}</h5>
          </div>
        );
      }
      if (type === 'foreignKeys') {
        return (
          <div className="card">
            <div className="card-body">
              <span>Table: {formData.foreignKeys[0].relTableName}</span>
              <p>Column: {formData.foreignKeys[0].relColumnName}</p>
              <button
                type="submit"
                className="btn btn-danger btn-block"
                onClick={onClick}>
                Remove foreign key relation
              </button>
            </div>
            <div className="card-footer p-2">
              <p className="text-small">
                Note: You can add a foreign key only once you remove this.
              </p>
            </div>
          </div>
        );
      }
    } else return null;
    return null;
  };

  return <div className="w-75">{fields.map(field => renderField(field))}</div>;
};

const mapStateToProps = state => ({
  formData: state.formData,
  schema: state.schema,
  table: state.table,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(FormMaker);
