import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { navigate } from 'gatsby';

import Loading from '../components/loading';
import { actions } from '../state/actions';
import Seo from '../components/seo';

// @ts-ignore
import WhitebrickLogo from '../images/whitebrick-logo.svg';

type IndexPageProps = {
  actions: any;
};

const IndexPage = ({ actions }: IndexPageProps) => {
  const { isLoading, error, isAuthenticated, loginWithRedirect } = useAuth0();

  useEffect(() => {
    actions.setTable('');
    actions.setSchema({});
  }, [actions]);

  if (isLoading) return <Loading />;
  if (error) return <div>Oops... {error.message}</div>;
  if (isAuthenticated) {
    navigate('/home');
    return <Loading />;
  }
  if (process.env.GATSBY_URL_ROOT_REDIRECT) {
    navigate(process.env.GATSBY_URL_ROOT_REDIRECT);
    return <Loading />;
  }
  return (
    <div className="d-flex align-items-center min-vh-100">
      <Seo title="Whitebrick" />
      <div className="container text-center">
        <div className="logo">
          <img src={WhitebrickLogo} alt="Logo" style={{ maxWidth: '220px' }} />
          <h1 style={{ fontSize: '4rem' }}>whitebrick</h1>
        </div>
        <button
          type="submit"
          className="btn btn-outline-primary mr-2"
          onClick={loginWithRedirect}>
          Log in
        </button>
        <button
          type="submit"
          className="btn btn-outline-dark mr-2"
          onClick={() => loginWithRedirect({ screen_hint: 'signup' })}>
          Sign up
        </button>
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  schemas: state.schemas,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(IndexPage);
