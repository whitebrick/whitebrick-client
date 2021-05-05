import * as React from "react"
import Table from '../components/table'
import { GraphQLClient, ClientContext } from 'graphql-hooks'

import 'rc-pagination/assets/index.css';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

const IndexPage = () => {

  const client = new GraphQLClient({
    url: process.env.GATSBY_HASURA_GRAPHQL_URL,
    headers: { 'x-hasura-admin-secret': process.env.GATSBY_HASURA_GRAPHQL_ADMIN_SECRET }
  })

  return (
    <ClientContext.Provider value={client}>
      <Table />
    </ClientContext.Provider>
  )
}

export default IndexPage
