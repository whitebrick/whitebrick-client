/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/use-static-query/
 */

import * as React from "react"
import PropTypes from "prop-types"
import { useStaticQuery, graphql } from "gatsby"

import Header from "./header"
import "./layout.css"
import Seo from "./seo"
import { useManualQuery, useQuery } from "graphql-hooks"
import { useEffect, useState } from "react"

const Layout = ({ children, tableName, setTableName, user }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  const SCHEMAS_QUERY = `query ($userEmail: String!) {
  wbSchemas(userEmail: $userEmail) {
    name
  }
}`;

  const SCHEMA_TABLES_QUERY = `query ($schemaName: String!){
  wbSchemaTableNames(schemaName: $schemaName)
}`;

  const { loading, error, data: schemas } = useQuery(SCHEMAS_QUERY, { variables: { userEmail: user }});
  const [schema, setSchema] = useState('');
  const [tables, setTables] = useState([]);
  const [fetchSchemaTables] = useManualQuery(SCHEMA_TABLES_QUERY);

  useEffect(() => {
    const fetchTables = async () => {
      if (schema !== '') {
        const { data } = await fetchSchemaTables({ variables: { schemaName: schema } });
        setTables(data.wbSchemaTableNames);
      }
    }
    fetchTables();
  }, [schema]);

  if (loading) return 'Loading...'
  if (error) return 'Something Bad Happened'

  return (
    <>
      <Seo title={data.site.siteMetadata?.title || `Title`} />
      <Header siteTitle={data.site.siteMetadata?.title || `Title`} />
      <div>
        <div className="row m-0">
          <aside className="col-2 p-0" id="left" style={{ overflow: 'scroll' }}>
            <div className="list-group w-100 rounded-0">
              {schemas.wbSchemas.map(field =>
                <a
                  style={{ textDecoration: `none`, cursor: 'pointer' }}
                  onClick={() => setSchema(field.name)}
                  className={`list-group-item  ${tableName === field.name && 'active'}`}
                >
                  {field.name}
                  {schema === field.name && (
                    <div className="list-group w-100 rounded-0">
                      {tables.map(table =>
                        <a
                          style={{ textDecoration: `none`, cursor: 'pointer' }}
                          onClick={() => setTableName(schema + '_' + table)}
                          className={`list-group-item  ${tableName === schema + '_' + table && 'active'}`}
                        >
                          {table}
                        </a>
                      )}
                    </div>
                  )}
                </a>
              )}
            </div>
          </aside>
          <main className="col-10">{children}</main>
        </div>
      </div>
    </>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
