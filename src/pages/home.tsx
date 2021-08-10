import React from 'react';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Layout from '../components/layouts/layout';
import Seo from '../components/seo';
import OrganizationDatabasesList from '../components/dashboard/organizationDatabasesList';
import MyDatabases from '../components/dashboard/MyDatabases';
import CreateSchema from '../components/dashboard/createSchema';
import { OrganizationItemType } from '../types';
import { actions } from '../state/actions';

type HomePropsType = {
  organizations: OrganizationItemType[];
};

const Home = ({ organizations }: HomePropsType) => (
  <>
    <Seo title="Home" />
    <Layout>
      {organizations &&
        organizations.length > 0 &&
        organizations.map(org => (
          <OrganizationDatabasesList organization={org} />
        ))}
      <MyDatabases />
      <MyDatabases name="Databases shared with me" />
      <CreateSchema />
    </Layout>
  </>
);

const mapStateToProps = state => ({
  organizations: state.organizations,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuthenticationRequired(Home));
