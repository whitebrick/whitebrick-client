import React, { useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { actions } from '../../../actions';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import Layout from '../../../components/layout';
import Seo from '../../../components/seo';

const DatabaseName = ({ params, schemas, schema, actions }) => {
  useEffect(() => {
    if (schemas && schemas.length > 0) {
      let schema = schemas.filter(
        schema => schema.name === params['databaseName'],
      )[0];
      actions.setSchema(schema);
    }
  }, [params, schemas, actions]);

  return (
    <React.Fragment>
      <Seo title={schema.label} />
      <Layout />
    </React.Fragment>
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
