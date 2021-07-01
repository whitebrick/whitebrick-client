import React from 'react';
import { bindActionCreators } from 'redux';
import { actions } from '../actions';
import { connect } from 'react-redux';
import { FaExternalLinkAlt } from 'react-icons/fa';
import FormMaker from './formMaker';
import SidePanel from './sidePanel';

type TableSidePanelPropsType = {
  show: boolean;
  setShow: (value: boolean) => void;
  onSave: () => void;
  type: string;
  column: any;
  formData: any;
  table: any;
  cloudContext: any;
  actions: any;
  columns: any[];
  tables: any[];
  deleteForeignKey: () => void;
};

const TableSidePanel = ({
  show,
  setShow,
  onSave,
  type,
  column,
  formData,
  table,
  cloudContext,
  actions,
  columns,
  tables,
  deleteForeignKey,
}: TableSidePanelPropsType) => {
  const newTableColumnFields: any[] = [
    { name: 'name', label: 'Column Name', type: 'text', required: true },
    { name: 'label', label: 'Column Label', type: 'text', required: true },
    {
      name: 'type',
      label: 'Column Type',
      type: 'select',
      options: cloudContext?.defaultColumnTypes,
      keyValuePairs: true,
    },
    {
      name: 'isPrimaryKey',
      label: 'make it primary key?',
      type: 'checkbox',
    },
    {
      name: 'foreignKey',
      label: 'Add a foreign key relation',
      type: 'button',
      onClick: () =>
        actions.setFormData({ ...formData, displayForeignKey: true }),
      render:
        type === 'edit'
          ? formData.displayForeignKey === undefined &&
            formData.foreignKeys?.length === 0
          : true,
    },
    {
      name: 'heading',
      label: 'Foreign key relations',
      type: 'heading',
      render:
        formData.displayForeignKey === true ||
        formData?.foreignKeys?.length > 0,
    },
    {
      name: 'foreignKeys',
      type: 'foreignKeys',
      render: formData?.foreignKeys?.length > 0,
      onClick: () => deleteForeignKey(),
    },
    {
      name: 'table',
      label: 'Table',
      type: 'select',
      options: tables,
      nested: true,
      nestedValue: 'name',
      render: formData.displayForeignKey === true,
    },
    {
      name: 'column',
      label: 'Column',
      type: 'select',
      options: formData.table
        ? tables.filter(table => table.name === formData.table)[0].columns
        : [],
      nested: true,
      nestedValue: 'name',
      render: formData.displayForeignKey === true,
    },
  ];

  const updateTableFields: any[] = [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
    },
    { name: 'label', label: 'Label', type: 'text', required: true },
    { label: 'Permissions', type: 'heading' },
    {
      type: 'permissionGrid',
    },
  ];

  return (
    <SidePanel
      show={show}
      setShow={setShow}
      onSave={onSave}
      name={
        type === 'add'
          ? `Add column to '${table.name}'`
          : type === 'newRow'
          ? `Add new row to '${table.name}'`
          : type === 'editRow'
          ? `Edit row in '${table.name}'`
          : type === 'edit'
          ? `Edit column '${column}'`
          : type === 'view'
          ? `Create a new view`
          : `${table.label} Table Settings`
      }>
      {type === 'newRow' || type === 'editRow' ? (
        <React.Fragment>
          {columns.map(c => (
            <div className="mt-3">
              <label>
                {c.label}: <span className="text-small">{c.type}</span>
              </label>
              {c.foreignKeys.length > 0 ? (
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text bg-light">
                      <FaExternalLinkAlt />
                    </span>
                  </div>
                  <input
                    className="form-control"
                    value={formData ? formData[c.name] : ''}
                    type={c.type === 'integer' ? 'number' : c.type}
                    onChange={e =>
                      actions.setFormData({
                        ...formData,
                        [c.name]: parseInt(e.target.value)
                          ? parseInt(e.target.value)
                          : e.target.value,
                      })
                    }
                  />
                </div>
              ) : (
                <input
                  className="form-control"
                  value={formData ? formData[c.name] : ''}
                  type={c.type === 'integer' ? 'number' : c.type}
                  onChange={e =>
                    actions.setFormData({
                      ...formData,
                      [c.name]: parseInt(e.target.value)
                        ? parseInt(e.target.value)
                        : e.target.value,
                    })
                  }
                />
              )}
              {c.isPrimaryKey && (
                <p className="text-small p-1">Note: This is a Primary Key</p>
              )}
              {c.foreignKeys.length > 0 && (
                <p className="text-small p-1">
                  Note: This is a Foreign Key to `
                  {c.foreignKeys[0].relTableName}`
                </p>
              )}
            </div>
          ))}
        </React.Fragment>
      ) : type === 'edit' || type === 'add' ? (
        <FormMaker fields={newTableColumnFields} />
      ) : type === 'view' ? (
        <FormMaker
          fields={[
            {
              name: 'name',
              label: 'Name of the view',
              type: 'text',
              required: true,
            },
          ]}
        />
      ) : (
        <FormMaker fields={updateTableFields} />
      )}
    </SidePanel>
  );
};

const mapStateToProps = state => ({
  formData: state.formData,
  table: state.table,
  columns: state.columns,
  cloudContext: state.cloudContext,
  tables: state.tables,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(TableSidePanel);
