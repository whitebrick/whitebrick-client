import * as React from "react"

import { GraphQLClient, ClientContext } from 'graphql-hooks'

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import Table from '../components/table'

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
