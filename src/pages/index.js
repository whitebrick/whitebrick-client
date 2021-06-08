import React, { useEffect } from 'react';
import { GraphQLClient, ClientContext } from 'graphql-hooks';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { useAuth0 } from '@auth0/auth0-react';

import Layout from '../components/layout';
import Loading from '../components/loading';

import '../styles/style.css';
import 'rc-pagination/assets/index.css';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { bindActionCreators } from 'redux';
import { actions } from '../actions';
import { connect } from 'react-redux';

const IndexPage = ({ accessToken, actions }) => {
  const {
    isLoading,
    isAuthenticated,
    loginWithRedirect,
    getAccessTokenSilently,
  } = useAuth0();

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

  useEffect(() => {
    (async () => {
      if (!isLoading && isAuthenticated) {
        const token = await getAccessTokenSilently();
        actions.setAccessToken(token);
      }
    })();
  }, [isAuthenticated, actions, getAccessTokenSilently, isLoading]);

  if (isLoading) return <Loading />;

  return (
    <React.Fragment>
      {isAuthenticated ? (
        <ClientContext.Provider value={client}>
          <Layout />
        </ClientContext.Provider>
      ) : (
        <div className="d-flex align-items-center min-vh-100">
          <div className="container text-center">
            <h3>Whitebrick</h3>
            <button
              className="btn btn-outline-primary"
              onClick={loginWithRedirect}>
              Login
            </button>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  accessToken: state.accessToken,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(IndexPage);
