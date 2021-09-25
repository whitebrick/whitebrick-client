import React from 'react';
import Layout from '../../../components/layouts/layout';
import TableLayout from '../../../components/layouts/tableLayout';

type TablePropsType = {
  params: any;
};

const DBTable = ({ params }: TablePropsType) => {
  return (
    <Layout hideSidebar>
      <TableLayout
        key={params.databaseName + params.tableName}
        params={params}
      />
    </Layout>
  );
};

export default DBTable;
