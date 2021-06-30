import React, { useEffect, useState } from 'react';
import { bindActionCreators } from 'redux';
import { actions } from '../actions';
import { connect } from 'react-redux';
import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react';
import Loading from './loading';
import { GraphQLClient, ClientContext } from 'graphql-hooks';
import { SubscriptionClient } from 'subscriptions-transport-ws';

type AuthWrapper = {
  schema: any;
  actions: any;
  sendAdminSecret: boolean;
  accessToken: string;
  children: React.ReactElement;
};

const AuthWrapper = ({
  schema,
  sendAdminSecret,
  accessToken,
  actions,
  children,
}: AuthWrapper) => {
  const {
    isLoading: authLoading,
    getAccessTokenSilently,
    getIdTokenClaims,
    user,
  } = useAuth0();
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    actions.setUser(user);
  }, [authLoading]);

  useEffect(() => {
    if (authLoading) {
      (async () => {
        await getAccessTokenSilently({
          ignoreCache: true,
          schema_name: schema.name,
        });
        const tokenClaims = await getIdTokenClaims();
        actions.setAccessToken(tokenClaims['__raw']);
        actions.setTokenClaims(tokenClaims);
        client.setHeader('Authorization', `Bearer ${tokenClaims['__raw']}`);
        setLoading(false);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema, authLoading]);

  const adminClient = new GraphQLClient({
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
      authorization: accessToken ? `Bearer ${accessToken}` : null,
    },
  });

  if (isLoading) return <Loading />;
  return (
    <ClientContext.Provider value={sendAdminSecret ? adminClient : client}>
      {children}
    </ClientContext.Provider>
  );
};

const mapStateToProps = state => ({
  schema: state.schema,
  sendAdminSecret: state.sendAdminSecret,
  accessToken: state.accessToken,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuthenticationRequired(AuthWrapper));
