import React from 'react';
import Layout from '../components/layouts/layout';
import { withAuthenticationRequired } from '@auth0/auth0-react';

const Home = () => <Layout />;

export default withAuthenticationRequired(Home);
