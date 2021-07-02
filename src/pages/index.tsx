import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

import Layout from '../components/layout';
import Loading from '../components/loading';
import { bindActionCreators } from 'redux';
import { actions } from '../state/actions';
import { connect } from 'react-redux';
import Seo from '../components/seo';

type IndexPageProps = {
  actions: any;
};

const IndexPage = ({ actions }: IndexPageProps) => {
  useEffect(() => {
    actions.setTable('');
    actions.setSchema({});
  }, [actions]);

  const { isLoading, isAuthenticated, loginWithRedirect } = useAuth0();

  return isLoading ? (
    <Loading />
  ) : (
    <React.Fragment>
      {isAuthenticated ? (
        <React.Fragment>
          <Seo title="Whitebrick" />
          <Layout />
        </React.Fragment>
      ) : (
        <div className="d-flex align-items-center min-vh-100">
          <Seo title="Whitebrick" />
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
  schemas: state.schemas,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(IndexPage);
