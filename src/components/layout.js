/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/use-static-query/
 */

import * as React from 'react';
import { useStaticQuery, graphql } from 'gatsby';

import Header from './header';
import Seo from './seo';
import { useManualQuery, useQuery } from 'graphql-hooks';
import { useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { actions } from '../actions';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import Table from './table';

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

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

const Layout = ({ table, user, schema, tables, fields, actions }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `);

  const { loading, error, data: schemas } = useQuery(SCHEMAS_QUERY, {
    variables: { userEmail: user },
  });
  const [fetchSchemaTables] = useManualQuery(SCHEMA_TABLES_QUERY);
  const [fetchQueryFields] = useManualQuery(GET_TABLE_FIELDS);

  useEffect(() => {
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
          <aside
            className="col-2 p-0"
            id="sidebar"
            style={{ overflow: 'scroll' }}>
            <div className="list-group w-100 rounded-0">
              {schemas.wbSchemas.map(field => (
                <div
                  style={{ textDecoration: `none`, cursor: 'pointer' }}
                  onClick={() => actions.setSchema(field.name)}
                  className={`list-group-item  ${
                    table === field.name && 'active'
                  }`}
                  key={field.name}>
                  {field.name}
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M16.95 10.707a1 1 0 10-1.414-1.414L12 12.828 8.464 9.293a1 1 0 10-1.414 1.414l4.243 4.243a1 1 0 001.414 0l4.243-4.243z"
                      fill="currentColor"
                    />
                  </svg>
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
          </aside>
          <main className="col-10">
            <Modal
              isOpen={user === ''}
              style={customStyles}
              ariaHideApp={false}>
              <ul className="list-group p-4 m-4" style={{ cursor: 'pointer' }}>
                <li
                  className="list-group-item"
                  onClick={() => actions.setUser('test_donna@example.com')}
                  onKeyDown={() => actions.setUser('test_donna@example.com')}>
                  test_donna@example.com
                </li>
                <li
                  className="list-group-item"
                  onClick={() => actions.setUser('test_debbie@example.com')}
                  onKeyDown={() => actions.setUser('test_debbie@example.com')}>
                  test_debbie@example.com
                </li>
                <li
                  className="list-group-item"
                  onClick={() => actions.setUser('test_daisy@example.com')}
                  onKeyDown={() => actions.setUser('test_daisy@example.com')}>
                  test_daisy@example.com
                </li>
                <li
                  className="list-group-item"
                  onClick={() => actions.setUser('test_nick_north@example.com')}
                  onKeyDown={() =>
                    actions.setUser('test_nick_north@example.com')
                  }>
                  test_nick_north@example.com
                </li>
              </ul>
            </Modal>
            {user !== '' && table !== '' && fields.length > 0 && (
              <Table key={table} />
            )}
          </main>
        </div>
      </div>
    </>
  );
};

const mapStateToProps = state => ({
  user: state.user,
  schema: state.schema,
  tables: state.tables,
  table: state.table,
  fields: state.fields,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
