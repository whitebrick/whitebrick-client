import React from 'react';
import Layout from '../../../components/layouts/layout';

type OrgSchemaType = {
  params: any;
};

const OrgSchema = ({ params }: OrgSchemaType) => {
  return <Layout params={params} />;
};

export default OrgSchema;
