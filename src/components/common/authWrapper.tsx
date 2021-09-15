import React, { useEffect, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { GraphQLClient, ClientContext } from 'graphql-hooks';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import axios from 'axios';
import { buildAxiosFetch } from '@lifeomic/axios-fetch';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import Loading from '../loading';
import { actions } from '../../state/actions';
import { formatError } from '../../utils/formatError';

type AuthWrapper = {
  actions: any;
  sendAdminSecret: boolean;
  accessToken: string;
  isLoading: boolean;
  isAuthenticated: boolean;
  getAccessTokenSilently: any;
  getIdTokenClaims: any;
  user: any;
  children: React.ReactElement;
};

const AuthWrapper = ({
  sendAdminSecret,
  accessToken,
  isLoading: authLoading,
  isAuthenticated,
  getAccessTokenSilently,
  getIdTokenClaims,
  user,
  actions,
  children,
}: AuthWrapper) => {
  const [isLoading, setLoading] = useState(true);

  const gqlAxios = axios.create();
  gqlAxios.interceptors.response.use(
    function onFullFilled(response) {
      return response;
    },
    async function onError(error) {
      const headers = {
        'Content-Type': 'application/json',
      };
      const message = formatError(error.toJSON());
      await axios.post(
        process.env.GATSBY_WB_ALARM_HOOK_URL,
        { content: message },
        { headers },
      );
      return error;
    },
  );

  const adminClient = new GraphQLClient({
    url: process.env.GATSBY_HASURA_GRAPHQL_URL,
    fetch: buildAxiosFetch(gqlAxios),
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
    fetch: buildAxiosFetch(gqlAxios),
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

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      (async () => {
        await getAccessTokenSilently({ ignoreCache: true });
        const tokenClaims = await getIdTokenClaims();
        actions.setAccessToken(tokenClaims.__raw);
        actions.setTokenClaims(tokenClaims);
        actions.setUser(user);
        client.setHeader('Authorization', `Bearer ${tokenClaims.__raw}`);
        setLoading(false);
      })();
    } else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  if (isLoading) return <Loading />;
  return (
    <ClientContext.Provider value={sendAdminSecret ? adminClient : client}>
      {children}
    </ClientContext.Provider>
  );
};

const mapStateToProps = state => ({
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
