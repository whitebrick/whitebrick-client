import React, { useEffect } from 'react';
import Layout from '../../components/layout';
import { useManualQuery } from 'graphql-hooks';
import { ORGANIZATION_QUERY } from '../../graphql/queries/wb';
import { bindActionCreators } from 'redux';
import { actions } from '../../state/actions';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import OrganizationLayout from '../../components/organizationLayout';
import Seo from '../../components/seo';
import { OrganizationItemType } from '../../types';

type OrganizationPropsType = {
  user: any;
  organization: OrganizationItemType;
  params: any;
  actions: any;
};

const Organization = ({
  user,
  organization,
  params,
  actions,
}: OrganizationPropsType) => {
  const [fetchOrganization] = useManualQuery(ORGANIZATION_QUERY, {
    variables: {
      name: params.name,
      currentUserEmail: user.email,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (params.name !== '' || params.name !== undefined) {
        if (user.email !== '' || user.email !== undefined) {
          const { loading, error, data } = await fetchOrganization();
          if (!loading && !error) {
            let org = data['wbOrganizationByName'];
            if (org !== null) {
              org.users = [];
              org.users = data['wbOrganizationUsers'];
              actions.setOrganization(org);
            }
          }
        }
      }
    };
    fetchData();
  }, [params, fetchOrganization, user, actions]);

  return (
    <Layout>
      <Seo title={organization.label} />
      <OrganizationLayout fetchOrganization={fetchOrganization} />
    </Layout>
  );
};

const mapStateToProps = state => ({
  user: state.user,
  organization: state.organization,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuthenticationRequired(Organization));
