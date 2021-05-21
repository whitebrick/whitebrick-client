/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/use-static-query/
 */

import React, { useEffect } from 'react';
import { useStaticQuery, graphql } from 'gatsby';

import Header from './header';
import Seo from './seo';
import { useManualQuery, useQuery } from 'graphql-hooks';
import { FaPlus } from 'react-icons/fa';
import { bindActionCreators } from 'redux';
import { actions } from '../actions';
import { connect } from 'react-redux';
import Table from './table';
import { useAuth0 } from '@auth0/auth0-react';

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
  const { loading, error, data: schemas } = useQuery(SCHEMAS_QUERY, {
    variables: { userEmail: user.email },
  });
  const [fetchSchemaTables] = useManualQuery(SCHEMA_TABLES_QUERY);
  const [fetchQueryFields] = useManualQuery(GET_TABLE_FIELDS);

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
                className="btn btn-primary btn-block"
                style={{ position: 'absolute', bottom: '30px' }}>
                <FaPlus /> Create new
              </button>
            </div>
          </aside>
          <main className="col-10">
            {user && table !== '' && fields.length > 0 && <Table key={table} />}
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
