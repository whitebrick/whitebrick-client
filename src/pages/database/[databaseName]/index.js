import React, { useEffect, useState } from 'react';
import { bindActionCreators } from 'redux';
import { actions } from '../../../actions';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import Layout from '../../../components/layout';
import Seo from '../../../components/seo';
import NotFound from '../../../components/notFound';
import Loading from '../../../components/loading';

const DatabaseName = ({ params, schemas, schema, actions }) => {
  const [found, setFound] = useState(true);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    if (schemas && schemas.length > 0) {
      let schema = schemas.filter(
        schema => schema.name === params['databaseName'],
      )[0];
      if (schema && Object.keys(schema).length > 0) actions.setSchema(schema);
    }
    setFound(Object.keys(schema).length > 0);
    setLoading(false);
  }, [params, schemas, schema, actions]);

  return !isLoading ? (
    <React.Fragment>
      {found ? (
        <div>
          <Seo title={schema.label} />
          <Layout />
        </div>
      ) : (
        <Layout>
          <NotFound name="Schema" />
        </Layout>
      )}
    </React.Fragment>
  ) : (
    <Loading />
  );
};

const mapStateToProps = state => ({
  schemas: state.schemas,
  schema: state.schema,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuthenticationRequired(DatabaseName));
