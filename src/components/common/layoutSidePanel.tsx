import React, { useContext } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { ClientContext, useManualQuery, useMutation } from 'graphql-hooks';
import { ColumnApi, GridApi } from 'ag-grid-community';
import { FaExternalLinkAlt } from 'react-icons/fa';
import * as gql from 'gql-query-builder';
import { toaster } from 'evergreen-ui';
import { UPDATE_TABLE_DETAILS_MUTATION } from '../../graphql/mutations/table';
import { SCHEMAS_QUERY } from '../../graphql/queries/wb';
import {
  ADD_OR_CREATE_COLUMN_MUTATION,
  ADD_OR_REMOVE_COLUMN_SEQUENCE,
  CREATE_OR_ADD_FOREIGN_KEY,
  CREATE_OR_DELETE_PRIMARY_KEYS,
  CREATE_ORGANIZATION_MUTATION,
  CREATE_SCHEMA_MUTATION,
  CREATE_TABLE_MUTATION,
  REMOVE_OR_DELETE_FOREIGN_KEY,
  SAVE_TABLE_USER_SETTINGS,
  UPDATE_COLUMN_MUTATION,
  UPDATE_ORGANIZATION_MUTATION,
} from '../../graphql/mutations/wb';
import {
  ColumnItemType,
  OrganizationItemType,
  SchemaItemType,
  TableItemType,
} from '../../types';
import { actions } from '../../state/actions';
import SidePanel from '../elements/sidePanel';
import FormMaker from '../elements/formMaker';

type LayoutSidePanelPropsType = {
  show: boolean;
  type: string;
  schemas: SchemaItemType[];
  schema: SchemaItemType;
  accessToken: string;
  formData: any;
  params: any;
  cloudContext: any;
  tables: TableItemType[];
  table: TableItemType;
  column: any;
  columns: ColumnItemType[];
  actions: any;
  gridAPI: GridApi;
  columnAPI: ColumnApi;
  fetchTables: () => any;
  orderBy: string;
  limit: number;
  offset: number;
  views: any[];
  defaultView: string;
  organization: OrganizationItemType;
};

const LayoutSidePanel = ({
  show,
  type,
  schemas,
  schema,
  formData,
  accessToken,
  cloudContext,
  params,
  tables,
  table,
  column,
  columns,
  fetchTables,
  gridAPI,
  columnAPI,
  orderBy,
  limit,
  offset,
  views,
  defaultView,
  organization,
  actions,
}: LayoutSidePanelPropsType) => {
  const client = useContext(ClientContext);
  const [createSchema] = useMutation(CREATE_SCHEMA_MUTATION);
  const [createTable] = useMutation(CREATE_TABLE_MUTATION);
  const [createOrganization] = useMutation(CREATE_ORGANIZATION_MUTATION);
  const [removeOrDeleteForeignKey] = useMutation(REMOVE_OR_DELETE_FOREIGN_KEY);
  const [updateTableMutation] = useMutation(UPDATE_TABLE_DETAILS_MUTATION);
  const [saveUserTableSettings] = useMutation(SAVE_TABLE_USER_SETTINGS);
  const [updateColumnMutation] = useMutation(UPDATE_COLUMN_MUTATION);
  const [addOrCreateColumnMutation] = useMutation(
    ADD_OR_CREATE_COLUMN_MUTATION,
  );
  const [createOrAddForeignKey] = useMutation(CREATE_OR_ADD_FOREIGN_KEY);
  const [createOrDeletePrimaryKeys] = useMutation(
    CREATE_OR_DELETE_PRIMARY_KEYS,
  );
  const [updateOrganizationMutation] = useMutation(
    UPDATE_ORGANIZATION_MUTATION,
  );
  const [addOrRemoveColumnSequenceMutation] = useMutation(
    ADD_OR_REMOVE_COLUMN_SEQUENCE,
  );

  const [fetchSchemas] = useManualQuery(SCHEMAS_QUERY);

  const deleteForeignKey = async () => {
    const { loading, error } = await removeOrDeleteForeignKey({
      variables: {
        schemaName: schema.name,
        tableName: table.name,
        columnNames: [formData.name],
        del: true,
        parentTableName: formData.foreignKeys[0].relTableName,
      },
    });
    if (!loading && !error) {
      actions.setShow(false);
      await fetchTables();
      const column = columns.filter(column => column.name === formData.name)[0];
      actions.setFormData(column);
      gridAPI.refreshCells({ force: true });
    }
  };

  const col = column && columns.filter(c => c.name === column)[0];
  const newTableFormFields: any[] = [
    {
      name: 'schema',
      label: 'Database Name',
      type: 'select',
      options: schemas,
      nested: true,
      nestedValue: 'name',
    },
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'label', label: 'Table Label', type: 'text', required: true },
  ];

  const updateTableFields: any[] = [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
    },
    { name: 'label', label: 'Label', type: 'text', required: true },
  ];

  const dataBaseFormFields: any[] = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    {
      name: 'label',
      label: 'Label',
      type: 'text',
      required: true,
    },
  ];

  const newOrganizationFormFields: any[] = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    {
      name: 'label',
      label: 'Label',
      type: 'text',
      required: true,
    },
  ];

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
      name: 'autoIncrement',
      label: 'Auto Increase value?',
      type: 'checkbox',
      render: col?.type === 'integer',
    },
    {
      name: 'startSequenceNumber',
      label: 'Start at (optional)',
      type: 'text',
      render: !!formData.autoIncrement,
    },
    {
      name: 'foreignKey',
      label: 'Add a foreign key relation',
      type: 'button',
      onClick: () =>
        actions.setFormData({ ...formData, displayForeignKey: true }),
      render:
        type === 'editColumn'
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

  const fetchSchemasData = async () => {
    const { data } = await fetchSchemas();
    actions.setSchemas(data.wbMySchemas);
  };

  const doMutation = variables => {
    const operation = gql.mutation({
      operation: ''.concat('update_', `${schema.name}_${table.name}`),
      variables: {
        where: {
          value: variables.where,
          type: `${`${schema.name}_${table.name}`}_bool_exp`,
          required: true,
        },
        _set: {
          value: variables._set,
          type: `${`${schema.name}_${table.name}`}_set_input`,
        },
      },
      fields: ['affected_rows'],
    });
    const fetchData = async () => client.request(operation);
    fetchData().finally(() => actions.setShow(false));
  };

  const saveSettingsToDB = async () => {
    const { loading, error } = await saveUserTableSettings({
      variables: {
        schemaName: schema.name,
        tableName: table.name,
        settings: {
          views,
          defaultView,
        },
      },
    });
    if (!loading && !error)
      toaster.success('Saved!', {
        duration: 10,
      });
  };

  const saveView = (toView = null) => {
    if (toView) {
      let viewObj = views.filter(view => view.name === toView)[0];
      const index = views.indexOf(viewObj);
      if (index !== -1) {
        viewObj = {
          name: toView,
          state: columnAPI.getColumnState(),
          orderBy,
          limit,
          offset,
        };
        const v = views;
        v[index] = viewObj;
        actions.setViews(v);
      }
    } else {
      const viewObj = {
        name: formData.name,
        state: columnAPI.getColumnState(),
        orderBy,
        limit,
        offset,
      };
      actions.setView(viewObj);
      actions.setDefaultView(formData.name);
    }
    saveSettingsToDB();
  };

  const onSave = async () => {
    if (type === 'createDatabase') {
      const { error, loading } = await createSchema({
        variables: {
          name: formData.name,
          label: formData.label,
        },
      });
      if (!loading && !error) {
        fetchSchemasData();
        actions.setShow(false);
      }
    } else if (type === 'createOrganization') {
      const { error, loading } = await createOrganization({
        variables: {
          name: formData.name,
          label: formData.label,
        },
      });
      if (!loading && !error) actions.setShow(false);
    } else if (type === 'createTable') {
      const { error, loading } = await createTable({
        variables: {
          schemaName: formData.schema.name,
          tableName: formData.name,
          tableLabel: formData.label,
          create: true,
        },
      });
      if (!loading && !error) actions.setShow(false);
    } else if (type === 'editDatabase') {
      // implement the edit schema once we have API
    } else if (type === 'newRow') {
      const operation = gql.mutation({
        operation: ''.concat('insert_', `${schema.name}_${table.name}`),
        variables: {
          objects: {
            value: formData,
            type: `[${`${schema.name}_${table.name}`}_insert_input!]`,
            required: true,
          },
        },
        fields: ['affected_rows'],
      });
      const fetchData = async () => client.request(operation);
      await fetchData();
      actions.setShow(false);
    } else if (type === 'editRow') {
      const variables = { where: {}, _set: {} };
      Object.keys(params).forEach(key => {
        variables.where[key] = {
          _eq: parseInt(params[key], 10)
            ? parseInt(params[key], 10)
            : params[key],
        };
      });
      variables._set = formData;
      doMutation(variables);
    } else if (type === 'editTable') {
      const variables: any = {
        schemaName: schema.name,
        tableName: table.name,
        newTableLabel: formData.label,
      };
      if (formData.name !== table.name) variables.newTableName = formData.name;
      const { loading, error } = await updateTableMutation({
        variables,
      });
      if (!error && !loading) actions.setShow(false);
    } else if (type === 'view') {
      saveView();
      actions.setShow(false);
    } else if (type === 'editColumn') {
      const variables: any = {
        schemaName: schema.name,
        tableName: table.name,
        columnName: column,
      };
      const col = columns.filter(c => c.name === column)[0];
      if (formData.name !== col.name) variables.newColumnName = formData.name;
      if (formData.label !== col.label)
        variables.newColumnLabel = formData.label;
      if (formData.type !== col.type) variables.newType = formData.type;
      if (
        variables.newColumnName ||
        variables.newColumnLabel ||
        variables.newType
      )
        await updateColumnMutation({
          variables,
        });
      if (formData.autoIncrement) {
        const vars: any = {
          schemaName: schema.name,
          tableName: table.name,
          columnName: formData.name,
        };
        if (formData.startSequenceNumber)
          vars.nextSeqNumber = parseInt(formData.startSequenceNumber, 10);
        await addOrRemoveColumnSequenceMutation({ variables: vars });
      } else if (formData.default) {
        await addOrRemoveColumnSequenceMutation({
          variables: {
            schemaName: schema.name,
            tableName: table.name,
            columnName: formData.name,
            remove: true,
          },
        });
      }
      if (formData.table && formData.column) {
        await createOrAddForeignKey({
          variables: {
            schemaName: schema.name,
            tableName: table.name,
            columnNames: [formData.name],
            parentTableName: formData.table,
            parentColumnNames: [formData.column],
            create: true,
          },
        });
      }
      fetchTables();
      gridAPI.refreshCells({ force: true });
      actions.setShow(false);
    } else if (type === 'editOrganization') {
      const variables: any = { name: organization.name };
      if (organization.name !== formData.name)
        variables.newName = formData.name;
      if (organization.label !== formData.label)
        variables.newLabel = formData.label;
      const { loading, error } = await updateOrganizationMutation({
        variables,
      });
      if (!loading && !error) actions.setShow(false);
    } else {
      const { loading, error } = await addOrCreateColumnMutation({
        variables: {
          schemaName: schema.name,
          tableName: table.name,
          create: true,
          columnName: formData.name,
          columnLabel: formData.label,
          columnType: formData.type,
        },
      });
      if (!loading && !error) {
        const columnNames = [];
        columns
          .filter(column => column.isPrimaryKey === true)
          .map(c => columnNames.push(c.name));
        if (formData.isPrimaryKey) {
          const {
            loading: deleteLoading,
            error: deleteError,
          } = await createOrDeletePrimaryKeys({
            variables: {
              schemaName: schema.name,
              tableName: table.name,
              del: true,
              columnNames,
            },
          });
          if (!deleteLoading && !deleteError) {
            await createOrDeletePrimaryKeys({
              variables: {
                schemaName: schema.name,
                tableName: table.name,
                columnNames: [formData.name],
              },
            });
          }
        }
        if (formData.table && formData.column) {
          const { loading, error } = await createOrAddForeignKey({
            variables: {
              schemaName: schema.name,
              tableName: table.name,
              columnNames: [formData.name],
              parentTableName: formData.table,
              parentColumnNames: [formData.column],
              create: true,
            },
          });
          if (!loading && !error) {
            gridAPI.refreshCells({ force: true });
            actions.setShow(false);
          }
        } else actions.setShow(false);
      }
    }
  };

  const getName = (type: string) => {
    if (type === 'token') return 'Access Token';
    if (type === 'createOrganization') return 'Create a new organization';
    if (type === 'editOrganization') return `Edit ${organization.label}`;
    if (type === 'createDatabase') return 'Create a new database';
    if (type === 'editDatabase') return `Edit ${schema.label}`;
    if (type === 'createTable') return 'Create a new table';
    if (type === 'editTable') return `Edit ${table.label}`;
    if (type === 'addColumn') return `Add column to ${table.label}`;
    if (type === 'editColumn') return `Edit column ${column}`;
    if (type === 'newRow') return `Add new row to ${table.label}`;
    if (type === 'editRow') return `Edit row in ${table.label}`;
    if (type === 'view') return `Create a new view in ${table.label}`;
    return null;
  };

  const getChildren = (type: string) => {
    if (type === 'token')
      return (
        <code
          className="w-100 p-4"
          aria-hidden="true"
          style={{ cursor: 'pointer' }}
          onClick={() =>
            navigator.clipboard.writeText(`Bearer ${accessToken}`)
          }>
          Bearer {accessToken}
        </code>
      );
    if (type === 'createOrganization' || type === 'editOrganization')
      return <FormMaker fields={newOrganizationFormFields} />;
    if (type === 'createDatabase' || type === 'editDatabase')
      return <FormMaker fields={dataBaseFormFields} />;
    if (type === 'createTable')
      return <FormMaker fields={newTableFormFields} />;
    if (type === 'editTable') return <FormMaker fields={updateTableFields} />;
    if (type === 'addColumn' || type === 'editColumn')
      return <FormMaker fields={newTableColumnFields} />;
    if (type === 'newRow' || type === 'editRow')
      return (
        <>
          {columns.map(c => (
            <div className="mt-3">
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
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
                        [c.name]: parseInt(e.target.value, 10)
                          ? parseInt(e.target.value, 10)
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
                      [c.name]: parseInt(e.target.value, 10)
                        ? parseInt(e.target.value, 10)
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
        </>
      );
    if (type === 'view')
      return (
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
      );
    return null;
  };

  return (
    <SidePanel
      show={show}
      renderSaveButton={type !== 'token'}
      setShow={actions.setShow}
      onSave={onSave}
      name={getName(type)}>
      {getChildren(type)}
    </SidePanel>
  );
};

const mapStateToProps = state => ({
  show: state.show,
  type: state.type,
  schemas: state.schemas,
  schema: state.schema,
  params: state.params,
  tables: state.tables,
  table: state.table,
  formData: state.formData,
  cloudContext: state.cloudContext,
  accessToken: state.accessToken,
  column: state.column,
  columns: state.columns,
  gridAPI: state.gridAPI,
  columnAPI: state.columnAPI,
  orderBy: state.orderBy,
  limit: state.limit,
  offset: state.offset,
  views: state.views,
  defaultView: state.defaultView,
  organization: state.organization,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuthenticationRequired(LayoutSidePanel));
