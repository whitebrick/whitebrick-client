import React, { useEffect, useState } from 'react';
import { useManualQuery, useMutation, useQuery } from 'graphql-hooks';
import { bindActionCreators } from 'redux';
import { actions } from '../state/actions';
import { connect } from 'react-redux';
import Table from './tableLayout';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import SidePanel from './sidePanel';
import Sidebar from './sidebar';
import FormMaker from './formMaker';
import {
  SCHEMAS_QUERY,
  SCHEMA_TABLES_QUERY,
  ORGANIZATIONS_QUERY,
} from '../graphql/queries/wb';
import {
  CREATE_ORGANIZATION_MUTATION,
  CREATE_SCHEMA_MUTATION,
  CREATE_TABLE_MUTATION,
} from '../graphql/mutations/wb';
import Header from './header';
import Databases from './common/databases';
import Tables from './common/tables';
import MyDatabases from './common/MyDatabases';
import { OrganizationItemType, SchemaItemType, TableItemType } from '../types';
import { isObjectEmpty } from '../utils/objectEmpty';

type LayoutPropsType = {
  table: TableItemType;
  schema: SchemaItemType;
  accessToken: string;
  formData: any;
  children?: React.ReactNode;
  tables: Array<TableItemType>;
  user: any;
  organizations: Array<OrganizationItemType>;
  params?: any;
  actions: any;
};

const Layout = ({
  table,
  schema,
  accessToken,
  formData,
  children,
  tables,
  user,
  actions,
  organizations,
  params = {},
}: LayoutPropsType) => {
  const [show, setShow] = useState(false);
  const [type, setType] = useState('');
  const [loaded, setLoaded] = useState(false);
  const { error, data: schemas, refetch } = useQuery(SCHEMAS_QUERY);
  const [fetchOrganizations] = useManualQuery(ORGANIZATIONS_QUERY);
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
      options: schemas?.wbMySchemas,
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
    { type: 'heading', label: 'User Roles' },
    { type: 'permissionGrid', label: 'schema' },
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

  useEffect(() => {
    if (schemas && schemas['wbMySchemas'] && schemas['wbMySchemas'].length > 0)
      actions.setSchemas(schemas['wbMySchemas']);
  }, [schemas, actions]);

  useEffect(() => {
    const fetchCloud = async () => {
      const { data } = await fetchCloudContext();
      actions.setCloudContext(data['wbCloudContext']);
    };
    fetchCloud();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (user.email) {
        const { data } = await fetchOrganizations();
        actions.setOrganizations(data?.wbMyOrganizations);
      }
    };
    fetchData();
  }, [actions, user, fetchOrganizations]);

  useEffect(() => {
    actions.setTables([]);
    const fetchTables = async () => {
      if (schema.name !== '' && schema.name !== undefined) {
        const { data } = await fetchSchemaTables({
          variables: { schemaName: schema.name, withColumns: true },
        });
        actions.setTables(data['wbMyTables']);
        setLoaded(true);
      }
    };
    fetchTables();
  }, [schema, fetchSchemaTables, actions]);

  const fetchTablesAndColumns = async () => {
    const { data } = await fetchSchemaTables({
      variables: { schemaName: schema.name, withColumns: true },
    });
    let t = data.wbMyTables.filter(
      tableName => tableName.name === table.name,
    )[0];
    if (t.columns.length > 0) {
      actions.setTables(data.wbMyTables);
      actions.setColumns(t.columns);
      actions.setOrderBy(t.columns[0].name);
    } else {
      actions.setColumns([]);
    }
    setLoaded(true);
  };

  const onSave = async () => {
    if (type === 'database') {
      const { error, loading } = await createSchema({
        variables: {
          name: formData.name,
          label: formData.label,
          email: user.email,
        },
      });
      if (!loading && !error) {
        refetch();
        setShow(false);
      }
    } else if (type === 'organization') {
      const { error, loading } = await createOrganization({
        variables: {
          name: formData.name,
          label: formData.label,
          currentUserEmail: user.email,
        },
      });
      if (!loading && !error) setShow(false);
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
        setShow(false);
      }
    }
  };

  useEffect(() => {
    if (Object.keys(params).length > 0) {
      if (params['databaseName'] && params['databaseName'] !== schema.name) {
        if (
          schemas &&
          schemas['wbMySchemas'] &&
          schemas['wbMySchemas'].length > 0
        ) {
          let s: any = schemas['wbMySchemas'].filter(
            schema => schema.name === params['databaseName'],
          )[0];
          if (s && Object.keys(s).length > 0) actions.setSchema(s);
        }
      }
      if (params['tableName']) {
        let table: any = tables.filter(
          table => table.name === params['tableName'],
        )[0];
        if (table && Object.keys(table).length > 0) {
          actions.setTable(table);
          actions.setColumns(table.columns);
          actions.setOrderBy(table.columns[0].name);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, schemas, tables, actions]);

  if (error) return <p>Something Bad Happened</p>;

  return (
    <>
      <Header
        setFormData={actions.setFormData}
        setShow={setShow}
        setType={setType}
      />
      <div className="mt-5">
        <Sidebar
          setFormData={actions.setFormData}
          setShow={setShow}
          setType={setType}
        />
        <main id="main">
          {!children ? (
            <React.Fragment>
              {user && schema.name !== '' && isObjectEmpty(table) ? (
                <Table
                  key={schema.name + table.name}
                  fetchTables={fetchTablesAndColumns}
                />
              ) : (
                <div>
                  {Object.keys(schema).length > 0 ? (
                    <Tables
                      loaded={loaded}
                      setShow={setShow}
                      setType={setType}
                    />
                  ) : (
                    <React.Fragment>
                      {organizations &&
                        organizations.length > 0 &&
                        organizations.map(org => (
                          <Databases
                            organization={org}
                            setShow={setShow}
                            setType={setType}
                          />
                        ))}
                      <MyDatabases setShow={setShow} setType={setType} />
                      <MyDatabases
                        name="Databases shared with me"
                        setShow={setShow}
                        setType={setType}
                      />
                    </React.Fragment>
                  )}
                </div>
              )}
              <SidePanel
                show={show}
                renderSaveButton={type !== ''}
                setShow={setShow}
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
                        className="list-group-item py-2"
                        aria-hidden="true"
                        onClick={() => {
                          setType('database');
                          actions.setFormData({});
                        }}>
                        Database
                      </div>
                      <div
                        className="list-group-item py-2"
                        aria-hidden="true"
                        onClick={() => {
                          setType('table');
                          actions.setFormData({});
                        }}>
                        Table
                      </div>
                      <div
                        className="list-group-item py-2"
                        aria-hidden="true"
                        onClick={() => {
                          setType('organization');
                          actions.setFormData({});
                        }}>
                        Organization
                      </div>
                    </div>
                  </React.Fragment>
                )}
              </SidePanel>
            </React.Fragment>
          ) : (
            <React.Fragment>{children}</React.Fragment>
          )}
        </main>
      </div>
    </>
  );
};

const mapStateToProps = state => ({
  schema: state.schema,
  tables: state.tables,
  table: state.table,
  accessToken: state.accessToken,
  formData: state.formData,
  user: state.user,
  organizations: state.organizations,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuthenticationRequired(Layout));
