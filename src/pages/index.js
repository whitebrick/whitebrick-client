import * as React from "react"
import Table from '../components/table'
import { GraphQLClient, ClientContext } from "graphql-hooks"

import 'rc-pagination/assets/index.css';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Layout from "../components/layout"
import { useState } from "react"

const IndexPage = () => {

  const client = new GraphQLClient({
    url: process.env.GATSBY_HASURA_GRAPHQL_URL,
    headers: { 'x-hasura-admin-secret': process.env.GATSBY_HASURA_GRAPHQL_ADMIN_SECRET }
  })

  const [tableName, setTableName] = useState('');

  return (
    <ClientContext.Provider value={client}>
      <Layout tableName={tableName} setTableName={setTableName}>
        <Table table={tableName} />
      </Layout>
    </ClientContext.Provider>
  )
}

export default IndexPage
