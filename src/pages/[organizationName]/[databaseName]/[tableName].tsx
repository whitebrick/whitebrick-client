import React from 'react';
import Layout from '../../../components/layouts/layout';
import TableLayout from '../../../components/layouts/tableLayout';

type OrgSchemaTableType = {
  params: any;
};

const OrgSchemaTable = ({ params }: OrgSchemaTableType) => {
  return (
    <Layout hideSidebar>
      <TableLayout
        key={params.databaseName + params.tableName}
        params={params}
      />
    </Layout>
  );
};

export default OrgSchemaTable;
