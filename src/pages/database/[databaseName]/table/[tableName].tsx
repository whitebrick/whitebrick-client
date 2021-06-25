import React from 'react';
import Layout from '../../../../components/layout';

type TablePropsType = {
  params: any;
};

const Table = ({ params }: TablePropsType) => {
  return <Layout params={params} />;
};

export default Table;
