import React, { useEffect, useState } from 'react';
import { EditIcon, IconButton } from 'evergreen-ui';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { useManualQuery } from 'graphql-hooks';
import SchemaTablesList from '../dashboard/schemaTablesList';
import Tabs from '../elements/tabs';
import { SchemaItemType } from '../../types';
import { actions } from '../../state/actions';
import Members from '../common/members';
import Breadcrumb from '../common/breadcrumb';
import { checkPermission } from '../../utils/checkPermission';
import { SCHEMA_BY_NAME_QUERY } from '../../graphql/queries/wb';
import Loading from '../loading';
import Layout from './layout';
import NotFound from '../notFound';
import Seo from '../seo';

type SchemaLayoutType = {
  schema: SchemaItemType;
  params: any;
  cloudContext: any;
  actions: any;
};

const SchemaLayout = ({
  schema,
  params,
  cloudContext,
  actions,
}: SchemaLayoutType) => {
  const userRole = schema?.role?.name;
  const canEdit = checkPermission('alter_schema', userRole);

  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tabs = [
    {
      title: 'Tables',
      element: <SchemaTablesList />,
    },
    {
      title: 'Members',
      element: <Members name="schema" />,
      noPane: true,
    },
  ];

  const [fetchSchemaByName] = useManualQuery(SCHEMA_BY_NAME_QUERY);

  useEffect(() => {
    const fetchSchema = async () => {
      const variables: any = { name: params.databaseName };
      if (params.organizationName)
        variables.organizationName = params.organizationName;
      const { loading, data, error } = await fetchSchemaByName({
        variables,
      });
      if (!loading) {
        if (error) setError(error);
        else actions.setSchema(data.wbMySchemaByName);
      }
    };
    if (params.databaseName) fetchSchema().finally(() => setLoading(false));
  }, [actions, fetchSchemaByName, params]);

  const getError = error => {
    if (
      error?.graphQLErrors[0].originalError.wbCode ===
      'WB_ORGANIZATION_NOT_FOUND'
    )
      return cloudContext.userMessages.WB_ORGANIZATION_URL_NOT_FOUND[0];
    if (error?.graphQLErrors[0].originalError.wbCode === 'WB_FORBIDDEN')
      return cloudContext.userMessages.WB_SCHEMA_URL_FORBIDDEN[0];
    if (error?.graphQLErrors[0].originalError.wbCode === 'WB_SCHEMA_NOT_FOUND')
      return cloudContext.userMessages.WB_SCHEMA_URL_NOT_FOUND[0];
    return cloudContext.userMessages[
      error?.graphQLErrors[0].originalError.wbCode
    ]?.[0];
  };

  if (isLoading) return <Loading />;
  if (error) return <NotFound name={getError(error)} />;
  return (
    <div className="mt-3">
      <Seo title={schema.label} />
      <div style={{ padding: `1rem` }}>
        <Breadcrumb />
        <h3 className="m-0 w-50">
          <span>
            {schema.label}
            {canEdit && (
              <IconButton
                appearance="minimal"
                className="ml-1"
                onClick={() => {
                  actions.setType('editDatabase');
                  actions.setFormData(schema);
                  actions.setShow(true);
                }}
                icon={EditIcon}
              />
            )}
          </span>
        </h3>
        <div className="mt-4">
          <Tabs items={tabs} />
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  schema: state.schema,
  users: state.users,
  cloudContext: state.cloudContext,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(SchemaLayout);
