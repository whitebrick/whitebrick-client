import React from 'react';
import Layout from '../../../components/layouts/layout';
import SchemaLayout from '../../../components/layouts/schemaLayout';
import Redirect from '../../../components/common/redirect';

type OrgSchemaPropsType = {
  params: any;
};

const OrgSchema = ({ params }: OrgSchemaPropsType) => {
  if (
    params.organizationName === 'redirect' &&
    params.databaseName === 'index.html'
  )
    return <Redirect />;
  return (
    <Layout>
      <SchemaLayout params={params} />
    </Layout>
  );
};

export default OrgSchema;
