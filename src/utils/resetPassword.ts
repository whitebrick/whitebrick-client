import fetch from 'isomorphic-fetch';
import store from '../state/store';

const ResetPassword = () => {
  const state = store.getState();
  const { email } = state.user;

  const apiConfig: any = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GATSBY_AUTH0_CLIENT_ID,
      email,
      connection: 'Username-Password-Authentication',
    }),
  };

  return fetch(
    `https://${process.env.GATSBY_AUTH0_DOMAIN}/dbconnections/change_password`,
    apiConfig,
  )
    .then(function ReturnResponse(response) {
      return response.data;
    })
    .catch(function CatchError(error) {
      console.error(error);
    });
};

export default ResetPassword;
