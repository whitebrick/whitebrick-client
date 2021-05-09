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
import { useQuery } from "graphql-hooks"

const Layout = ({ children, tableName, setTableName }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  const TABLES_QUERY = `{
  __schema{
    queryType{
      fields{
        name
      }
    }
  }
}
`;

  const { loading, error, data: tables } = useQuery(TABLES_QUERY);

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
              {tables['__schema'].queryType.fields.map(field => {
                let lastWord = field.name.split('_').pop();
                if (lastWord !== 'pk' && lastWord !== 'aggregate')
                  return (
                    <a
                      style={{ textDecoration: `none`, cursor: 'pointer' }}
                      onClick={() => setTableName(field.name)}
                      className={`list-group-item  ${tableName === field.name && 'active'}`}
                    >
                      {field.name}
                    </a>
                  )
              })}
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
