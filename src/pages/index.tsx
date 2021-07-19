import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

import Loading from '../components/loading';
import { bindActionCreators } from 'redux';
import { actions } from '../state/actions';
import { connect } from 'react-redux';
import Seo from '../components/seo';
import { navigate } from 'gatsby';

type IndexPageProps = {
  actions: any;
};

const IndexPage = ({ actions }: IndexPageProps) => {
  useEffect(() => {
    actions.setTable('');
    actions.setSchema({});
  }, [actions]);

  const { isLoading, isAuthenticated, loginWithRedirect } = useAuth0();

  if (isLoading) return <Loading />;
  if (isAuthenticated) navigate('/dashboard');
  else {
    if (process.env.URL_ROOT_REDIRECT) navigate(process.env.URL_ROOT_REDIRECT);
    return (
      <div className="d-flex align-items-center min-vh-100">
        <Seo title="Whitebrick" />
        <div className="container text-center">
          <h3>Whitebrick</h3>
          <button className="btn btn-outline-primary" onClick={loginWithRedirect}>
            Login
          </button>
        </div>
      </div>
    );
  }
};

const mapStateToProps = state => ({
  schemas: state.schemas,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(IndexPage);
