import React, { useEffect } from 'react';
import { useManualQuery, useMutation } from 'graphql-hooks';
import { bindActionCreators } from 'redux';
import { actions } from '../../state/actions';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import SidePanel from '../common/sidePanel';
import Sidebar from '../sidebar';
import FormMaker from '../common/formMaker';
import { SCHEMAS_QUERY, SCHEMA_TABLES_QUERY } from '../../graphql/queries/wb';
import {
  CREATE_ORGANIZATION_MUTATION,
  CREATE_SCHEMA_MUTATION,
  CREATE_TABLE_MUTATION,
} from '../../graphql/mutations/wb';
import Header from '../common/header';
import { SchemaItemType, TableItemType } from '../../types';
import { isObjectEmpty } from '../../utils/objectEmpty';
import TableLayout from './tableLayout';

type LayoutPropsType = {
  show: boolean;
  type: string;
  schemas: SchemaItemType[];
  table: TableItemType;
  schema: SchemaItemType;
  accessToken: string;
  formData: any;
  children?: React.ReactNode;
  user: any;
  actions: any;
  cloudContext: any;
  hideSidebar?: boolean;
};

const Layout = ({
  show,
  type,
  schemas,
  table,
  schema,
  accessToken,
  formData,
  children,
  user,
  actions,
  cloudContext,
  hideSidebar = false,
}: LayoutPropsType) => {
  const [fetchSchemas] = useManualQuery(SCHEMAS_QUERY);
  const [fetchCloudContext] = useManualQuery(`{ wbCloudContext }`);
  const [fetchSchemaTables] = useManualQuery(SCHEMA_TABLES_QUERY);
  const [createSchema] = useMutation(CREATE_SCHEMA_MUTATION);
  const [createTable] = useMutation(CREATE_TABLE_MUTATION);
  const [createOrganization] = useMutation(CREATE_ORGANIZATION_MUTATION);

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

  const fetchSchemasData = async () => {
    const { data } = await fetchSchemas();
    actions.setSchemas(data.wbMySchemas);
  };

  useEffect(() => {
    if (schemas.length < 1) fetchSchemasData();
  }, []);

  useEffect(() => {
    const fetchCloud = async () => {
      const { data } = await fetchCloudContext();
      return data;
    };
    if (isObjectEmpty(cloudContext))
      fetchCloud().then(data =>
        actions.setCloudContext(data['wbCloudContext']),
      );
  }, []);

  // useEffect(() => {
  //   const fetchTables = async () => {
  //     if (schema.name !== '' && schema.name !== undefined) {
  //       await fetchSchemaTables({
  //         variables: { schemaName: schema.name, withColumns: true },
  //       }).then(({ data }) => actions.setTables(data?.wbMyTables));
  //     }
  //   };
  //   actions.setTables([]);
  //   fetchTables();
  // }, [schema, fetchSchemaTables, actions]);

  const fetchTablesAndColumns = async () => {
    const { data } = await fetchSchemaTables({
      variables: {
        schemaName: schema.name,
        withColumns: true,
        withSettings: true,
      },
    });
    actions.setTables(data.wbMyTables);
    let t = data.wbMyTables.filter(
      tableName => tableName.name === table.name,
    )[0];
    if (t.columns.length > 0) {
      actions.setColumns(t.columns);
      actions.setOrderBy(t.columns[0].name);
      actions.setViews(t.settings.views);
      actions.setDefaultView(t.settings.defaultView);
    } else {
      actions.setColumns([]);
    }
  };

  const onSave = async () => {
    if (type === 'database') {
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
    } else if (type === 'organization') {
      const { error, loading } = await createOrganization({
        variables: {
          name: formData.name,
          label: formData.label,
        },
      });
      if (!loading && !error) actions.setShow(false);
    } else if (type === 'editSchema') {
      // implement the edit schema once we have API
    } else {
      const { error, loading } = await createTable({
        variables: {
          schemaName: formData.schema.name,
          tableName: formData.name,
          tableLabel: formData.label,
          create: true,
        },
      });
      if (!loading && !error) {
        await fetchTablesAndColumns();
        actions.setShow(false);
      }
    }
  };

  return (
    <>
      <Header
        setFormData={actions.setFormData}
        setShow={actions.setShow}
        setType={actions.setType}
      />
      <div className="mt-5">
        {!hideSidebar && (
          <Sidebar
            setFormData={actions.setFormData}
            setShow={actions.setShow}
            setType={actions.setType}
          />
        )}
        <main id="main" style={{ marginLeft: !hideSidebar ? '250px' : '0' }}>
          {!children ? (
            <React.Fragment>
              {user && schema.name !== '' && !isObjectEmpty(table) && (
                <TableLayout
                  key={schema.name + table.name}
                  fetchTables={fetchTablesAndColumns}
                />
              )}
            </React.Fragment>
          ) : (
            <React.Fragment>{children}</React.Fragment>
          )}
          <SidePanel
            show={show}
            renderSaveButton={type !== 'token'}
            setShow={actions.setShow}
            onSave={onSave}
            name={
              type === 'token'
                ? 'Access Token'
                : type === 'editSchema'
                ? `${schema.label} settings`
                : `Create a new ${type}?`
            }>
            {type === 'database' ? (
              <FormMaker fields={newDataBaseFormFields} />
            ) : type === 'table' ? (
              <FormMaker fields={newTableFormFields} />
            ) : type === 'organization' ? (
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
            ) : type === 'editSchema' ? (
              <FormMaker fields={editDataBaseFormFields} />
            ) : (
              <React.Fragment>
                <div className="list-group w-100 rounded-0">
                  <div
                    className="list-group-item"
                    aria-hidden="true"
                    onClick={() => {
                      actions.setType('database');
                      actions.setFormData({});
                    }}>
                    Database
                  </div>
                  <div
                    className="list-group-item"
                    aria-hidden="true"
                    onClick={() => {
                      actions.setType('table');
                      actions.setFormData({});
                    }}>
                    Table
                  </div>
                  <div
                    className="list-group-item"
                    aria-hidden="true"
                    onClick={() => {
                      actions.setType('organization');
                      actions.setFormData({});
                    }}>
                    Organization
                  </div>
                </div>
              </React.Fragment>
            )}
          </SidePanel>
        </main>
      </div>
    </>
  );
};

const mapStateToProps = state => ({
  show: state.show,
  type: state.type,
  schemas: state.schemas,
  schema: state.schema,
  table: state.table,
  accessToken: state.accessToken,
  formData: state.formData,
  user: state.user,
  cloudContext: state.cloudContext,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuthenticationRequired(Layout));
