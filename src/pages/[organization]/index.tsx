import React, { useEffect, useState } from 'react';
import { useManualQuery } from 'graphql-hooks';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { actions } from '../../state/actions';
import { ORGANIZATION_QUERY } from '../../graphql/queries/wb';
import Layout from '../../components/layouts/layout';
import OrganizationLayout from '../../components/layouts/organizationLayout';
import Seo from '../../components/seo';
import { OrganizationItemType } from '../../types';
import NotFound from '../../components/notFound';

type OrganizationPropsType = {
  organization: OrganizationItemType;
  cloudContext: any;
  params: any;
  actions: any;
};

const Organization = ({
  organization,
  cloudContext,
  params,
  actions,
}: OrganizationPropsType) => {
  const [error, setError] = useState(null);
  const [fetchOrganization] = useManualQuery(ORGANIZATION_QUERY, {
    variables: {
      name: params.organization,
    },
  });

  const fetchData = async () => {
    const { loading, error, data } = await fetchOrganization();
    if (!loading) {
      if (error) setError(error);
      else {
        const org = data.wbMyOrganizationByName;
        if (org !== null) {
          org.users = [];
          org.users = data.wbOrganizationUsers;
          actions.setOrganization(org);
        }
      }
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getError = error => {
    if (
      error?.graphQLErrors[0].originalError.wbCode ===
      'WB_ORGANIZATION_NOT_FOUND'
    )
      return cloudContext.userMessages.WB_ORGANIZATION_URL_NOT_FOUND[0];
    if (error?.graphQLErrors[0].originalError.wbCode === 'WB_FORBIDDEN')
      return cloudContext.userMessages.WB_ORGANIZATION_URL_FORBIDDEN[0];
    return cloudContext.userMessages[
      error?.graphQLErrors[0].originalError.wbCode
    ][0];
  };

  return (
    <Layout>
      {error ? (
        <Layout>
          <NotFound name={getError(error)} />
        </Layout>
      ) : (
        <>
          <Seo title={`${organization.label} | Organization`} />
          <OrganizationLayout refetch={fetchData} />
        </>
      )}
    </Layout>
  );
};

const mapStateToProps = state => ({
  organization: state.organization,
  cloudContext: state.cloudContext,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuthenticationRequired(Organization));
