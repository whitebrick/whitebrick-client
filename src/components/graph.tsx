import React from 'react';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import GraphiQL from 'graphiql';
import 'graphiql/graphiql.min.css';
import '../styles/style.css';
import { connect } from 'react-redux';

type GraphProps = {
  accessToken: any;
};

const Graph = ({ accessToken }: GraphProps) => {
  const URL = process.env.GATSBY_HASURA_GRAPHQL_URL;
  const defaultQuery = `
    query {
        wbMySchemas(withSettings: false) {
            id
            name
        }
    }
    `;

  function graphQLFetcher(graphQLParams: any) {
    return fetch(URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        authorization: accessToken ? `Bearer ${accessToken}` : null,
      },
      body: JSON.stringify(graphQLParams),
    }).then(response => response.json());
  }

  return <GraphiQL fetcher={graphQLFetcher} defaultQuery={defaultQuery} />;
};

const mapStateToProps = state => ({
  accessToken: state.accessToken,
});

export default connect(
  mapStateToProps,
  null,
)(withAuthenticationRequired(Graph));
