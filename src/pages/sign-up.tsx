import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { navigate } from 'gatsby';
import Loading from '../components/loading';

const SignUp = () => {
  const { isLoading, isAuthenticated, loginWithRedirect } = useAuth0();

  if (isLoading) return <Loading />;
  if (!isAuthenticated) loginWithRedirect({ screen_hint: 'signup' });
  else navigate('/home');
  return <Loading />;
};

export default SignUp;
