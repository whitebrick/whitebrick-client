import React, { useEffect, useState } from 'react';
import Layout from '../../../components/layouts/layout';
import { useManualQuery } from 'graphql-hooks';
import { SCHEMA_BY_NAME_QUERY } from '../../../graphql/queries/wb';
import { bindActionCreators } from 'redux';
import { actions } from '../../../state/actions';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import Loading from '../../../components/loading';
import NotFound from '../../../components/notFound';
import { SchemaItemType } from '../../../types';

type OrgSchemaType = {
  cloudContext: any;
  schema: SchemaItemType;
  params: any;
  actions: any;
};

const OrgSchema = ({
  cloudContext,
  params,
  actions,
  schema,
}: OrgSchemaType) => {
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fetchSchemaByName] = useManualQuery(SCHEMA_BY_NAME_QUERY, {
    variables: {
      name: params.databaseName,
      organizationName: params.organization,
    },
  });

  const fetchSchema = async () => {
    const { loading, data, error } = await fetchSchemaByName();
    if (!loading) {
      if (error) setError(error);
      else actions.setSchema(data.wbMySchemaByName);
    }
  };

  useEffect(() => {
    if (params['databaseName'] && params['databaseName'] !== schema?.name)
      fetchSchema().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  return isLoading ? (
    <Loading />
  ) : error ? (
    <Layout>
      <NotFound
        name={
          error?.graphQLErrors[0].originalError.wbCode ===
          'WB_ORGANIZATION_NOT_FOUND'
            ? cloudContext.userMessages['WB_ORGANIZATION_URL_NOT_FOUND'][0]
            : error?.graphQLErrors[0].originalError.wbCode === 'WB_FORBIDDEN'
            ? cloudContext.userMessages['WB_SCHEMA_URL_FORBIDDEN'][0]
            : error?.graphQLErrors[0].originalError.wbCode ===
              'WB_SCHEMA_NOT_FOUND'
            ? cloudContext.userMessages['WB_SCHEMA_URL_NOT_FOUND'][0]
            : cloudContext.userMessages[
                error?.graphQLErrors[0].originalError.wbCode
              ][0]
        }
      />
    </Layout>
  ) : (
    <Layout params={params} />
  );
};

const mapStateToProps = state => ({
  cloudContext: state.cloudContext,
  schema: state.schema,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuthenticationRequired(OrgSchema));
