import React from 'react';
import Layout from '../../../components/layouts/layout';
import SchemaLayout from '../../../components/layouts/schemaLayout';

type DatabaseNamePropsType = {
  params: any;
};

const DatabaseName = ({ params }: DatabaseNamePropsType) => {
  return (
    <Layout>
      <SchemaLayout params={params} />
    </Layout>
  );
};

export default DatabaseName;
