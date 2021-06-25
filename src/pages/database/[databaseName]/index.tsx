import React from 'react';
import Layout from '../../../components/layout';

type DatabaseNamePropsType = {
  params: any;
};

const DatabaseName = ({ params }: DatabaseNamePropsType) => {
  return <Layout params={params} />;
};

export default DatabaseName;
