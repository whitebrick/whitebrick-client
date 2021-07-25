import fetch from 'isomorphic-fetch';
import store from '../state/store';

const ResetPassword = () => {
  const state = store.getState();
  const email: string = state.user.email;

  const apiConfig: any = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GATSBY_AUTH0_CLIENTID,
      email: email,
      connection: 'Username-Password-Authentication',
    }),
  };

  return fetch(
    `https://${process.env.GATSBY_AUTH0_DOMAIN}/dbconnections/change_password`,
    apiConfig,
  )
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.error(error);
    });
};

export default ResetPassword;
