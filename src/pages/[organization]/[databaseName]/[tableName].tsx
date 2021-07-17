import React from 'react';
import Layout from '../../../components/layouts/layout';

type OrgSchemaTableType = {
  params: any;
};

const OrgSchemaTable = ({ params }: OrgSchemaTableType) => {
  return <Layout params={params} />;
};

export default OrgSchemaTable;
