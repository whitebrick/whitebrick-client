import React, { useState } from "react"
import Table from '../components/table'
import { GraphQLClient, ClientContext } from "graphql-hooks"
import { SubscriptionClient } from 'subscriptions-transport-ws'
import { Provider, useStore } from 'react-redux'
import Modal from 'react-modal';

import store from '../store';

import '../styles/sidebar.css';
import 'rc-pagination/assets/index.css';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Layout from "../components/layout"

const IndexPage = () => {
  const client = new GraphQLClient({
    url: process.env.GATSBY_HASURA_GRAPHQL_URL,
    subscriptionClient: new SubscriptionClient(process.env.GATSBY_HASURA_GRAPHQL_WSS_URL, {
      reconnect: true,
      minTimeout: 3000,
      lazy: true,
      connectionParams: {
        headers: {
          'x-hasura-admin-secret': process.env.GATSBY_HASURA_GRAPHQL_ADMIN_SECRET
        }
      }
    }),
    headers: { 'x-hasura-admin-secret': process.env.GATSBY_HASURA_GRAPHQL_ADMIN_SECRET }
  })

  const [user, setUser] = useState('');
  const state = store.getState();

  return (
    <Provider store={store}>
      <ClientContext.Provider value={client}>
        <Layout />
      </ClientContext.Provider>
    </Provider>
  )
}

export default IndexPage
