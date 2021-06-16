/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/browser-apis/
 */

// You can delete this file if you're not using it

import React from 'react';
import { Provider } from 'react-redux';
import { Auth0Provider } from '@auth0/auth0-react';
import { navigate } from 'gatsby';

import store from './src/store';
import { GraphQLClient, ClientContext } from 'graphql-hooks';
import { SubscriptionClient } from 'subscriptions-transport-ws';

import './src/styles/style.css';
import 'rc-pagination/assets/index.css';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const onRedirectCallback = appState => navigate(appState?.returnTo || '/');

export const wrapRootElement = ({ element }) => {
  const state = store.getState();
  const accessToken = state.accessToken;

  const client = new GraphQLClient({
    url: process.env.GATSBY_HASURA_GRAPHQL_URL,
    subscriptionClient: new SubscriptionClient(
      process.env.GATSBY_HASURA_GRAPHQL_WSS_URL,
      {
        reconnect: true,
        minTimeout: 3000,
        lazy: true,
        connectionParams: {
          headers: {
            'x-hasura-admin-secret':
              process.env.GATSBY_HASURA_GRAPHQL_ADMIN_SECRET,
            authorization: accessToken ? `Bearer ${accessToken}` : null,
          },
        },
      },
    ),
    headers: {
      'x-hasura-admin-secret': process.env.GATSBY_HASURA_GRAPHQL_ADMIN_SECRET,
      authorization: accessToken ? `Bearer ${accessToken}` : null,
    },
  });

  return (
    <Provider store={store}>
      <ClientContext.Provider value={client}>
        <Auth0Provider
          domain={process.env.AUTH0_DOMAIN}
          clientId={process.env.AUTH0_CLIENTID}
          audience={process.env.AUTH0_AUDIENCE}
          responseType="token id_token"
          scope="openid profile email"
          useRefreshTokens={true}
          redirectUri={process.env.AUTH0_CALLBACK}
          onRedirectCallback={onRedirectCallback}>
          {element}
        </Auth0Provider>
      </ClientContext.Provider>
    </Provider>
  );
};
