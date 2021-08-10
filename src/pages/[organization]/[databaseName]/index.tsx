import React, { useEffect, useState } from 'react';
import { useManualQuery } from 'graphql-hooks';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { actions } from '../../../state/actions';
import { SCHEMA_BY_NAME_QUERY } from '../../../graphql/queries/wb';
import Layout from '../../../components/layouts/layout';
import Loading from '../../../components/loading';
import NotFound from '../../../components/notFound';
import { SchemaItemType } from '../../../types';
import Seo from '../../../components/seo';
import SchemaLayout from '../../../components/layouts/schemaLayout';

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
    if (params.databaseName && params.databaseName)
      fetchSchema().finally(() => setLoading(false));
  }, [params]);

  return isLoading ? (
    <Loading />
  ) : error ? (
    <Layout>
      <NotFound
        name={
          error?.graphQLErrors[0].originalError.wbCode ===
          'WB_ORGANIZATION_NOT_FOUND'
            ? cloudContext.userMessages.WB_ORGANIZATION_URL_NOT_FOUND[0]
            : error?.graphQLErrors[0].originalError.wbCode === 'WB_FORBIDDEN'
            ? cloudContext.userMessages.WB_SCHEMA_URL_FORBIDDEN[0]
            : error?.graphQLErrors[0].originalError.wbCode ===
              'WB_SCHEMA_NOT_FOUND'
            ? cloudContext.userMessages.WB_SCHEMA_URL_NOT_FOUND[0]
            : cloudContext.userMessages[
                error?.graphQLErrors[0].originalError.wbCode
              ][0]
        }
      />
    </Layout>
  ) : (
    <>
      <Seo title={schema.label} />
      <Layout>
        <SchemaLayout />
      </Layout>
    </>
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
