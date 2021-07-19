import React from 'react';
import { bindActionCreators } from 'redux';
import { actions } from '../state/actions';
import { connect } from 'react-redux';
import Layout from '../components/layouts/layout';
import { withAuthenticationRequired } from '@auth0/auth0-react';

const Home = () => {
  return <Layout />;
};

const mapStateToProps = state => ({
  schemas: state.schemas,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuthenticationRequired(Home));
