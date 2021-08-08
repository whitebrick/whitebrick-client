import React, { useEffect, useState } from 'react';
import Layout from '../../../../components/layouts/layout';
import { useManualQuery } from 'graphql-hooks';
import {
  SCHEMA_BY_NAME_QUERY,
  SCHEMA_TABLE_BY_NAME_QUERY,
} from '../../../../graphql/queries/wb';
import { bindActionCreators } from 'redux';
import { actions } from '../../../../state/actions';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import Loading from '../../../../components/loading';
import NotFound from '../../../../components/notFound';
import { SchemaItemType, TableItemType } from '../../../../types';

type TablePropsType = {
  params: any;
  actions: any;
  cloudContext: any;
  schema: SchemaItemType;
  table: TableItemType;
};

const Table = ({
  params,
  actions,
  cloudContext,
  schema,
  table,
}: TablePropsType) => {
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fetchSchemaTableByName] = useManualQuery(SCHEMA_TABLE_BY_NAME_QUERY, {
    variables: {
      schemaName: params.databaseName,
      tableName: params.tableName,
      withColumns: true,
      withSettings: true,
    },
  });
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

  const fetchSchemaTable = async () => {
    const { loading, data, error } = await fetchSchemaTableByName();
    if (!loading) {
      if (error) setError(error);
      else {
        actions.setTable(data.wbMyTableByName);
        actions.setColumns(data.wbMyTableByName.columns);
        actions.setOrderBy(data.wbMyTableByName.columns[0].name);
        if (data.wbMyTableByName.settings) {
          if (
            data.wbMyTableByName.settings.views &&
            data.wbMyTableByName.settings.views.length > 0
          ) {
            actions.setViews(data.wbMyTableByName.settings.views);
          }
          if (data.wbMyTableByName.settings.defaultView)
            actions.setDefaultView(data.wbMyTableByName.settings.defaultView);
        }
      }
    }
  };

  useEffect(() => {
    if (params['databaseName'] && params['databaseName'])
      fetchSchema().then(() => {
        if (params['tableName'] && params['tableName'])
          fetchSchemaTable().finally(() => setLoading(false));
      });
    else if (params['tableName'] && params['tableName'])
      fetchSchemaTable().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  return isLoading ? (
    <Loading />
  ) : error ? (
    <Layout>
      <NotFound
        name={
          cloudContext.userMessages[
            error?.graphQLErrors[0].originalError.wbCode
          ][0]
        }
      />
    </Layout>
  ) : (
    <Layout />
  );
};

const mapStateToProps = state => ({
  cloudContext: state.cloudContext,
  schema: state.schema,
  table: state.table,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuthenticationRequired(Table));
