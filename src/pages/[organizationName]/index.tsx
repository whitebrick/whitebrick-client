import React from 'react';
import Layout from '../../components/layouts/layout';
import OrganizationLayout from '../../components/layouts/organizationLayout';

type OrganizationPropsType = {
  params: any;
};

const OrganizationName = ({ params }: OrganizationPropsType) => {
  return (
    <Layout>
      <OrganizationLayout params={params} />
    </Layout>
  );
};

export default OrganizationName;
