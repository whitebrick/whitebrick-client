import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

import Layout from '../components/layout';

const IndexPage = () => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  return (
    <React.Fragment>
      {isAuthenticated ? (
        <Layout />
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

export default IndexPage;
