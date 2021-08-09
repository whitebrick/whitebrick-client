import React from 'react';
import Layout from '../components/layouts/layout';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import Seo from '../components/seo';
import OrganizationDatabasesList from '../components/dashboard/organizationDatabasesList';
import MyDatabases from '../components/dashboard/MyDatabases';
import CreateSchema from '../components/dashboard/createSchema';
import { OrganizationItemType } from '../types';
import { bindActionCreators } from 'redux';
import { actions } from '../state/actions';
import { connect } from 'react-redux';

type HomePropsType = {
  organizations: OrganizationItemType[];
};

const Home = ({ organizations }: HomePropsType) => (
  <React.Fragment>
    <Seo title="Home" />
    <Layout>
      <React.Fragment>
        {organizations &&
          organizations.length > 0 &&
          organizations.map(org => (
            <OrganizationDatabasesList organization={org} />
          ))}
        <MyDatabases />
        <MyDatabases name="Databases shared with me" />
        <CreateSchema />
      </React.Fragment>
    </Layout>
  </React.Fragment>
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
