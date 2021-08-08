import React from 'react';
import Layout from '../components/layouts/layout';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import Seo from '../components/seo';

const Home = () => (
  <React.Fragment>
    <Seo title="Home" />
    <Layout />
  </React.Fragment>
);

export default withAuthenticationRequired(Home);
