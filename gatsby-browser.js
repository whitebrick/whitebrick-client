/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/browser-apis/
 */

// You can delete this file if you're not using it

import React from 'react';
import { Provider } from 'react-redux';
import { Auth0Context, Auth0Provider } from '@auth0/auth0-react';
import { navigate } from 'gatsby';

import store from './src/state/store';
import AuthWrapper from './src/components/common/AuthWrapper';

import './src/styles/style.css';
import 'rc-pagination/assets/index.css';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Loading from './src/components/loading';

const onRedirectCallback = appState => navigate(appState?.returnTo || '/');

export const wrapRootElement = ({ element }) => {
  return (
    <Provider store={store}>
      <Auth0Provider
        domain={process.env.AUTH0_DOMAIN}
        clientId={process.env.AUTH0_CLIENTID}
        audience={process.env.AUTH0_AUDIENCE}
        responseType="token id_token"
        scope="openid profile email offline_access"
        useRefreshTokens={true}
        cacheLocation="localstorage"
        redirectUri={process.env.AUTH0_CALLBACK}
        onRedirectCallback={onRedirectCallback}>
        <Auth0Context.Consumer>
          {({
            isAuthenticated,
            isLoading,
            getAccessTokenSilently,
            getIdTokenClaims,
            user,
          }) => {
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
            else return element;
          }}
        </Auth0Context.Consumer>
      </Auth0Provider>
    </Provider>
  );
};
