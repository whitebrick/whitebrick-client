/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/use-static-query/
 */

import React, { useEffect, useState } from 'react';
import { useStaticQuery, graphql } from 'gatsby';

import Seo from './seo';
import { useManualQuery, useMutation, useQuery } from 'graphql-hooks';
import { FaHome } from 'react-icons/fa';
import { bindActionCreators } from 'redux';
import { actions } from '../actions';
import { connect } from 'react-redux';
import Table from './table';
import { useAuth0 } from '@auth0/auth0-react';
import SidePanel from './sidePanel';

const GET_TABLE_FIELDS = `query ($name: String!){
  __type(name: $name) {
    name
    fields {
      name
      type{
        kind
        ofType{
          kind
        }
      }
    }
  }
}`;

const SCHEMAS_QUERY = `query ($userEmail: String!) {
  wbSchemas(userEmail: $userEmail) {
    name
  }
}`;

const SCHEMA_TABLES_QUERY = `query ($schemaName: String!){
  wbSchemaTableNames(schemaName: $schemaName)
}`;

const CREATE_SCHEMA_MUTATION = `mutation ($name: String!, $label: String!, $email: String!){
  wbCreateSchema(name: $name, label: $label, userOwnerEmail: $email){
    name
  }
}`;

const CREATE_TABLE_MUTATION = `mutation ($schemaName: String!, $tableName: String!){
  wbCreateTable(schemaName: $schemaName, tableName: $tableName)
}`;

const Layout = ({ table, schema, tables, fields, actions }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `);

  const { user, logout } = useAuth0();
  const [show, setShow] = useState(false);
  const [type, setType] = useState('');
  const [formData, setFormData] = useState({});
  const { loading, error, data: schemas, refetch } = useQuery(SCHEMAS_QUERY, {
    variables: { userEmail: user.email },
  });
  const [fetchSchemaTables] = useManualQuery(SCHEMA_TABLES_QUERY);
  const [fetchQueryFields] = useManualQuery(GET_TABLE_FIELDS);
  const [createSchema] = useMutation(CREATE_SCHEMA_MUTATION);
  const [createTable] = useMutation(CREATE_TABLE_MUTATION);

  const [userShow, setUserShow] = useState(false);
  const menuClass = `dropdown-menu${userShow ? ' show' : ''}`;

  useEffect(() => {
    actions.setTables([]);
    const fetchTables = async () => {
      if (schema !== '' && schema !== undefined) {
        const { data } = await fetchSchemaTables({
          variables: { schemaName: schema },
        });
        actions.setTables(data.wbSchemaTableNames);
      }
    };
    fetchTables();
  }, [schema, fetchSchemaTables, actions]);

  useEffect(() => {
    const fetchFields = async () => {
      if (table !== '' && table !== undefined) {
        const { data } = await fetchQueryFields({ variables: { name: table } });
        const { fields } = data['__type'];
        let f = [];
        fields.forEach(field => {
          let kind = field.type?.kind;
          let type = field.type.ofType?.kind
            ? field.type.ofType.kind
            : 'SCALAR';
          if (
            kind !== 'OBJECT' &&
            kind !== 'LIST' &&
            type !== 'OBJECT' &&
            type !== 'LIST'
          )
            f.push(field.name);
        });
        actions.setFields(f);
      }
    };
    fetchFields();
  }, [table, fetchQueryFields, actions]);

  const setTable = name => {
    actions.setTable(name);
    actions.setFields([]);
  };

  const onSave = async () => {
    if (type === 'database') {
      const { error, loading } = createSchema({
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
    } else {
      const { error, loading } = createTable({
        variables: {
          schemaName: formData.schema,
          tableName: formData.name,
        },
      });
      if (!loading && !error) {
        const { data } = await fetchSchemaTables({
          variables: { schemaName: schema },
        });
        actions.setTables(data.wbSchemaTableNames);
        setShow(false);
      }
    }
  };

  if (loading) return 'Loading...';
  if (error) return 'Something Bad Happened';

  return (
    <>
      <Seo title={data.site.siteMetadata?.title || `Title`} />
      <div>
        <div className="row m-0">
          <aside className="col-3 p-0" id="sidebar">
            <div className="row m-0">
              <aside className="col-3 p-0 sidebar-collapsed" id="sidebar">
                <div className="px-4 pt-4">
                  <FaHome color="white" size="2em" />
                </div>
                <div
                  onClick={() => {
                    setFormData({});
                    setType('');
                    setShow(true);
                  }}
                  aria-hidden="true"
                  className="btn px-4 pt-4">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    role="presentation">
                    <path
                      d="M13 11V3.993A.997.997 0 0012 3c-.556 0-1 .445-1 .993V11H3.993A.997.997 0 003 12c0 .557.445 1 .993 1H11v7.007c0 .548.448.993 1 .993.556 0 1-.445 1-.993V13h7.007A.997.997 0 0021 12c0-.556-.445-1-.993-1H13z"
                      fill="white"
                      fillRule="evenodd"
                    />
                  </svg>
                </div>
                <div
                  className="p-4"
                  style={{ position: 'absolute', bottom: 0 }}>
                  <div
                    className="dropdown avatar"
                    onMouseEnter={() => setUserShow(!userShow)}
                    onClick={() => setUserShow(!userShow)}
                    aria-hidden="true">
                    <img src={user.picture} alt={user.nickname} />
                    <div className={menuClass}>
                      <div className="p-4 text-center">
                        <img
                          src={user.picture}
                          alt={user.nickname}
                          style={{ width: '50px', height: '50px' }}
                        />
                        <div className="mt-2">
                          <b>{user.name}</b>
                          <div
                            style={{ color: '#757575', fontSize: '0.875rem' }}>
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <div className="dropdown-divider" />
                      <button
                        className="dropdown-item"
                        onClick={() =>
                          logout({ returnTo: window.location.origin })
                        }
                        aria-hidden="true">
                        Log out
                      </button>
                    </div>
                  </div>
                </div>
              </aside>
              <aside className="col-9 p-0" id="sidebar">
                <div className="list-group w-100 rounded-0">
                  <div className="sidebar-heading list-group-item">
                    Databases
                  </div>
                  {schemas.wbSchemas.map(field => (
                    <div
                      style={{ cursor: 'pointer' }}
                      onClick={() => actions.setSchema(field.name)}
                      aria-hidden="true"
                      className={`list-group-item schema  ${
                        table === field.name && 'active'
                      }`}
                      key={field.name}>
                      {field.name}
                      {schema === field.name && (
                        <div className="list-group w-100 rounded-0">
                          {tables &&
                            tables.map(tableName => (
                              <div
                                style={{
                                  textDecoration: `none`,
                                  cursor: 'pointer',
                                }}
                                onClick={() =>
                                  setTable(schema + '_' + tableName)
                                }
                                aria-hidden="true"
                                className={`list-group-item py-1 ${
                                  table === schema + '_' + tableName && 'active'
                                }`}
                                key={tableName}>
                                {tableName}
                              </div>
                            ))}
                          <div
                            onClick={() => {
                              setShow(true);
                              setType('table');
                              setFormData({ schema });
                            }}
                            style={{ cursor: 'pointer' }}
                            aria-hidden="true"
                            className="list-group-item py-1">
                            + create table
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </aside>
          <main className="col-9">
            {user && table !== '' && fields.length > 0 && <Table key={table} />}
            <SidePanel
              show={show}
              renderSaveButton={type !== ''}
              setShow={setShow}
              onSave={onSave}
              type="save"
              name={`Create a new ${type}?`}>
              {type === 'database' ? (
                <React.Fragment>
                  <div className="mt-3">
                    <label htmlFor="name">Name</label>
                    <input
                      className="form-control"
                      value={formData?.name}
                      onChange={e =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mt-3">
                    <label htmlFor="label">Label</label>
                    <input
                      className="form-control"
                      value={formData?.label}
                      onChange={e =>
                        setFormData({ ...formData, label: e.target.value })
                      }
                      required
                    />
                  </div>
                </React.Fragment>
              ) : type === 'table' ? (
                <React.Fragment>
                  <div className="mt-3">
                    <label htmlFor="schema">Database Name</label>
                    <select
                      className="form-control"
                      value={formData.schema}
                      onChange={e =>
                        setFormData({ ...formData, schema: e.target.value })
                      }>
                      {schemas.wbSchemas.map(schema => (
                        <option key={schema.name} value={schema.name}>
                          {schema.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-3">
                    <label htmlFor="name">Name</label>
                    <input
                      className="form-control"
                      value={formData?.name}
                      onChange={e =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <div className="list-group w-100 rounded-0">
                    <div
                      className="list-group-item py-2"
                      onClick={() => {
                        setType('database');
                        setFormData({});
                      }}>
                      Database
                    </div>
                    <div
                      className="list-group-item py-2"
                      onClick={() => {
                        setType('table');
                        setFormData({});
                      }}>
                      Table
                    </div>
                  </div>
                </React.Fragment>
              )}
            </SidePanel>
          </main>
        </div>
      </div>
    </>
  );
};

const mapStateToProps = state => ({
  schema: state.schema,
  tables: state.tables,
  table: state.table,
  fields: state.fields,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
