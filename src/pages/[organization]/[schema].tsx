import React from 'react';
import Layout from '../../components/layouts/layout';

type DatabaseNamePropsType = {
  params: any;
};

const OrgSchema = ({ params }: DatabaseNamePropsType) => {
  const p = {
    organizationName: params.organization,
    databaseName: params.schema,
  };
  return <Layout params={p} />;
};

export default OrgSchema;
