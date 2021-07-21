import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

import Loading from '../components/loading';
import { bindActionCreators } from 'redux';
import { actions } from '../state/actions';
import { connect } from 'react-redux';
import Seo from '../components/seo';
import { navigate } from 'gatsby';

// @ts-ignore
import WhitebrickLogo from '../images/whitebrick-logo.svg';

type IndexPageProps = {
  actions: any;
};

const IndexPage = ({ actions }: IndexPageProps) => {
  const { isLoading, isAuthenticated, loginWithRedirect } = useAuth0();

  useEffect(() => {
    actions.setTable('');
    actions.setSchema({});
  }, [actions]);

  if (isLoading) return <Loading />;
  if (isAuthenticated) {
    navigate('/home');
    return <Loading />;
  } else {
    if (process.env.URL_ROOT_REDIRECT) navigate(process.env.URL_ROOT_REDIRECT);
    return (
      <div className="d-flex align-items-center min-vh-100">
        <Seo title="Whitebrick" />
        <div className="container text-center">
          <div className="logo">
            <img src={WhitebrickLogo} alt="Logo" style={{ maxWidth: '220px' }} />
            <h1 style={{ fontSize: '4rem' }}>whitebrick</h1>
          </div>
          <button
            className="btn btn-outline-primary mr-2"
            onClick={loginWithRedirect}>
            Log in
          </button>
          <button
            className="btn btn-outline-dark mr-2"
            onClick={() => loginWithRedirect({ screen_hint: 'signup' })}>
            Sign up
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
