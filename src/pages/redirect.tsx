import React from 'react';
import { navigate } from 'gatsby';
import Loading from '../components/loading';
import { getQueryParams } from '../utils/queryParams';
import TableLayout from '../components/layouts/tableLayout';
import Layout from '../components/layouts/layout';
import SchemaLayout from '../components/layouts/schemaLayout';
import OrganizationLayout from '../components/layouts/organizationLayout';

const Redirect = () => {
  const params = getQueryParams(window.location.search);

  const redirectURL = (params: any) => {
    let path;
    if (params.organization_name) {
      if (params.schema_name && params.table_name)
        path = `${params.organization_name}/${params.schema_name}/${params.table_name}`;
      else if (params.schema_name)
        path = `${params.organization_name}/${params.schema_name}`;
      else path = params.organization_name;
    } else {
      // eslint-disable-next-line
      if (params.schema_name && params.table_name)
        path = `db/${params.schema_name}/table/${params.table_name}`;
      else path = `db/${params.schema_name}`;
    }
    window.history.replaceState(
      null,
      null,
      `${window.location.origin}/${path}`,
    );
  };

  const renderLayout = () => {
    if (params.table_name) {
      const p: any = {
        databaseName: params.schema_name,
        tableName: params.table_name,
      };
      if (params.organization_name)
        p.organizationName = params.organization_name;
      redirectURL(params);
      return (
        <Layout hideSidebar>
          <TableLayout
            key={params.schema_name + params.table_name}
            params={p}
          />
        </Layout>
      );
    }
    if (params.schema_name) {
      const p: any = { databaseName: params.schema_name };
      if (params.organization_name)
        p.organizationName = params.organization_name;
      redirectURL(params);
      return (
        <Layout>
          <SchemaLayout params={p} />
        </Layout>
      );
    }
    if (params.organization_name) {
      redirectURL(params);
      return (
        <Layout>
          <OrganizationLayout
            params={{ organizationName: params.organization_name }}
          />
        </Layout>
      );
    }
    navigate('/');
    return <Loading />;
  };

  return renderLayout();
};

export default Redirect;
