import fetch from 'isomorphic-fetch';
import store from '../store';

const GraphQLFetch = ({ query, variables }) => {
  const state = store.getState();
  const accessToken = state.accessToken;
  const body = {
    query,
    variables,
  };

  const apiConfig = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': process.env.GATSBY_HASURA_GRAPHQL_ADMIN_SECRET,
      authorization: accessToken ? `Bearer ${accessToken}` : null,
    },
    body: JSON.stringify(body),
  };

  return fetch(process.env.GATSBY_HASURA_GRAPHQL_URL, apiConfig).then(function (
    response,
  ) {
    const contentType = response.headers.get('content-type');
    if (response.ok) {
      if (contentType && contentType.indexOf('application/json') !== -1) {
        return response.json().then(json => json);
      }
      if (contentType && contentType.indexOf('text') !== -1) {
        return response.text().then(text => text);
      }
      return response;
    }
    console.error(
      `Response status ${response.status} during dataFetch for url ${response.url}.`,
    );
    throw response;
  });
};

export default GraphQLFetch;
