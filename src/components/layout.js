/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/use-static-query/
 */

import React, { useEffect, useState } from 'react';
import { useStaticQuery, graphql } from 'gatsby';

import Header from './header';
import Seo from './seo';
import { useManualQuery, useMutation, useQuery } from 'graphql-hooks';
import { FaPlus } from 'react-icons/fa';
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

  const { user } = useAuth0();
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({});
  const { loading, error, data: schemas, refetch } = useQuery(SCHEMAS_QUERY, {
    variables: { userEmail: user.email },
  });
  const [fetchSchemaTables] = useManualQuery(SCHEMA_TABLES_QUERY);
  const [fetchQueryFields] = useManualQuery(GET_TABLE_FIELDS);
  const [createSchema] = useMutation(CREATE_SCHEMA_MUTATION);

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

  const onSave = () => {
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
  };

  if (loading) return 'Loading...';
  if (error) return 'Something Bad Happened';

  return (
    <>
      <Seo title={data.site.siteMetadata?.title || `Title`} />
      <Header siteTitle={data.site.siteMetadata?.title || `Title`} />
      <div>
        <div className="row m-0">
          <aside className="col-2 p-0" id="sidebar">
            <div className="list-group w-100 rounded-0">
              <div className="sidebar-heading list-group-item">Databases</div>
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
                            onClick={() => setTable(schema + '_' + tableName)}
                            aria-hidden="true"
                            className={`list-group-item py-1 ${
                              table === schema + '_' + tableName && 'active'
                            }`}
                            key={tableName}>
                            {tableName}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="create-button p-2 d-flex align-items-center">
              <button
                onClick={() => setShow(true)}
                className="btn btn-primary btn-block"
                style={{ position: 'absolute', bottom: '30px' }}>
                <FaPlus /> Create new
              </button>
            </div>
          </aside>
          <main className="col-10">
            {user && table !== '' && fields.length > 0 && <Table key={table} />}
            <SidePanel
              show={show}
              setShow={setShow}
              onSave={onSave}
              type="save"
              name="Create a new database">
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
