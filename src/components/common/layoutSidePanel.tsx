import React, { useContext } from 'react';
import FormMaker from '../common/formMaker';
import SidePanel from '../common/sidePanel';
import { bindActionCreators } from 'redux';
import { actions } from '../../state/actions';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import {
  ColumnItemType,
  OrganizationItemType,
  SchemaItemType,
  TableItemType,
} from '../../types';
import { ClientContext, useManualQuery, useMutation } from 'graphql-hooks';
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
import { SCHEMAS_QUERY } from '../../graphql/queries/wb';
import { ColumnApi, GridApi } from 'ag-grid-community';
import { FaExternalLinkAlt } from 'react-icons/fa';
import * as gql from 'gql-query-builder';
import { UPDATE_TABLE_DETAILS_MUTATION } from '../../graphql/mutations/table';
import { toaster } from 'evergreen-ui';

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

  const newDataBaseFormFields: any[] = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    {
      name: 'label',
      label: 'Label',
      type: 'text',
      required: true,
    },
  ];

  const editDataBaseFormFields: any[] = [
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

  const updateTableFields: any[] = [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
    },
    { name: 'label', label: 'Label', type: 'text', required: true },
  ];

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
        parentTableName: formData['foreignKeys'][0]['relTableName'],
      },
    });
    if (!loading && !error) {
      actions.setShow(false);
      await fetchTables();
      let column = columns.filter(column => column.name === formData.name)[0];
      actions.setFormData(column);
      gridAPI.refreshCells({ force: true });
    }
  };

  const fetchSchemasData = async () => {
    const { data } = await fetchSchemas();
    actions.setSchemas(data.wbMySchemas);
  };

  const doMutation = variables => {
    const operation = gql.mutation({
      operation: ''.concat('update_', schema.name + '_' + table.name),
      variables: {
        where: {
          value: variables.where,
          type: `${schema.name + '_' + table.name}_bool_exp`,
          required: true,
        },
        _set: {
          value: variables['_set'],
          type: `${schema.name + '_' + table.name}_set_input`,
        },
      },
      fields: ['affected_rows'],
    });
    const fetchData = async () => await client.request(operation);
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
      let index = views.indexOf(viewObj);
      if (index !== -1) {
        viewObj = {
          name: toView,
          state: columnAPI.getColumnState(),
          orderBy,
          limit,
          offset,
        };
        views[index] = viewObj;
        actions.setViews(views);
      }
    } else {
      let viewObj = {
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
        operation: ''.concat('insert_', schema.name + '_' + table.name),
        variables: {
          objects: {
            value: formData,
            type: `[${schema.name + '_' + table.name}_insert_input!]`,
            required: true,
          },
        },
        fields: ['affected_rows'],
      });
      const fetchData = async () => await client.request(operation);
      await fetchData();
      actions.setShow(false);
    } else if (type === 'editRow') {
      let variables = { where: {}, _set: {} };
      for (let key in params) {
        variables.where[key] = {
          _eq: parseInt(params[key]) ? parseInt(params[key]) : params[key],
        };
      }
      variables['_set'] = formData;
      doMutation(variables);
    } else if (type === 'updateTable') {
      let variables: any = {
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
      let variables: any = {
        schemaName: schema.name,
        tableName: table.name,
        columnName: column,
      };
      let col = columns.filter(c => c.name === column)[0];
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
        let vars: any = {
          schemaName: schema.name,
          tableName: table.name,
          columnName: formData.name,
        };
        if (formData.startSequenceNumber)
          vars.nextSeqNumber = parseInt(formData.startSequenceNumber);
        await addOrRemoveColumnSequenceMutation({ variables: vars });
      } else {
        if (formData.default) {
          await addOrRemoveColumnSequenceMutation({
            variables: {
              schemaName: schema.name,
              tableName: table.name,
              columnName: formData.name,
              remove: true,
            },
          });
        }
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
      let variables: any = { name: organization.name };
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
        let columnNames = [];
        columns
          .filter(column => column['isPrimaryKey'] === true)
          .map(c => columnNames.push(c.name));
        if (formData['isPrimaryKey']) {
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

  return (
    <SidePanel
      show={show}
      renderSaveButton={type !== 'token'}
      setShow={actions.setShow}
      onSave={onSave}
      name={
        type === 'token'
          ? 'Access Token'
          : type === 'editDatabase'
          ? `${schema.label} settings`
          : type === 'createOrganization'
          ? `Create a new organization`
          : type === 'editOrganization'
          ? `Update ${organization.label}`
          : type === 'createDatabase'
          ? `Create a new database`
          : type === 'createTable'
          ? `Create a new table`
          : type === 'newRow'
          ? `Add new row to '${table.name}'`
          : type === 'editRow'
          ? `Edit row in '${table.name}'`
          : type === 'addColumn'
          ? `Add column to '${table.name}'`
          : type === 'editColumn'
          ? `Edit column '${column}'`
          : type === 'view'
          ? `Create a new view`
          : type === 'updateTable' && `${table.label} Table Settings`
      }>
      {type === 'createDatabase' ? (
        <FormMaker fields={newDataBaseFormFields} />
      ) : type === 'createTable' ? (
        <FormMaker fields={newTableFormFields} />
      ) : type === 'createOrganization' || type === 'editOrganization' ? (
        <FormMaker fields={newOrganizationFormFields} />
      ) : type === 'token' ? (
        <React.Fragment>
          <code
            className="w-100 p-4"
            aria-hidden="true"
            style={{ cursor: 'pointer' }}
            onClick={() =>
              navigator.clipboard.writeText(`Bearer ${accessToken}`)
            }>
            Bearer {accessToken}
          </code>
        </React.Fragment>
      ) : type === 'editDatabase' ? (
        <FormMaker fields={editDataBaseFormFields} />
      ) : type === 'newRow' || type === 'editRow' ? (
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
      ) : type === 'editColumn' || type === 'addColumn' ? (
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
        type === 'updateTable' && <FormMaker fields={updateTableFields} />
      )}
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
