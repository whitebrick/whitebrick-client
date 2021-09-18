import React from 'react';
import Layout from '../../../components/layouts/layout';
import SchemaLayout from '../../../components/layouts/schemaLayout';

type OrgSchemaPropsType = {
  params: any;
};

const OrgSchema = ({ params }: OrgSchemaPropsType) => {
  return (
    <Layout>
      <SchemaLayout params={params} />
    </Layout>
  );
};

export default OrgSchema;
