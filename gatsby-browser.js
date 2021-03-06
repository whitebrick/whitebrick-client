import React from 'react';
import { Provider } from 'react-redux';
import { Auth0Context, Auth0Provider } from '@auth0/auth0-react';
import { navigate } from 'gatsby';

import store from './src/state/store';
import AuthWrapper from './src/components/common/authWrapper';

import './src/styles/style.css';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import Loading from './src/components/loading';
import AuthError from './src/components/common/authError';

const onRedirectCallback = appState => navigate(appState?.returnTo || '/');

export const wrapRootElement = ({ element }) => {
  return (
    <Provider store={store}>
      <Auth0Provider
        domain={process.env.GATSBY_AUTH0_DOMAIN}
        clientId={process.env.GATSBY_AUTH0_CLIENT_ID}
        audience={process.env.GATSBY_AUTH0_AUDIENCE}
        responseType="token id_token"
        scope="openid profile email offline_access"
        useRefreshTokens
        cacheLocation="localstorage"
        redirectUri={process.env.GATSBY_AUTH0_CALLBACK}
        onRedirectCallback={onRedirectCallback}>
        <Auth0Context.Consumer>
          {({
            isAuthenticated,
            isLoading,
            getAccessTokenSilently,
            getIdTokenClaims,
            user,
            error,
            logout,
          }) => {
            if (error)
              return <AuthError message={error.message} logout={logout} />;
            if (isLoading) return <Loading />;
            if (!isLoading && isAuthenticated)
              return (
                <AuthWrapper
                  isLoading={isLoading}
                  isAuthenticated={isAuthenticated}
                  getAccessTokenSilently={getAccessTokenSilently}
                  getIdTokenClaims={getIdTokenClaims}
                  user={user}>
                  {element}
                </AuthWrapper>
              );
            return element;
          }}
        </Auth0Context.Consumer>
      </Auth0Provider>
    </Provider>
  );
};
