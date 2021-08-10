import React, { useEffect } from 'react';
import { useManualQuery } from 'graphql-hooks';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { actions } from '../../state/actions';
import Sidebar from '../sidebar';
import {
  SCHEMAS_QUERY,
  SCHEMA_TABLE_BY_NAME_QUERY,
} from '../../graphql/queries/wb';
import Header from '../elements/header';
import { SchemaItemType, TableItemType } from '../../types';
import { isObjectEmpty } from '../../utils/objectEmpty';
import LayoutSidePanel from '../common/layoutSidePanel';

type LayoutPropsType = {
  schemas: SchemaItemType[];
  table: TableItemType;
  schema: SchemaItemType;
  children: React.ReactNode;
  actions: any;
  cloudContext: any;
  hideSidebar?: boolean;
};

const defaultProps = {
  hideSidebar: false,
};

const Layout = ({
  schemas,
  table,
  schema,
  children,
  actions,
  cloudContext,
  hideSidebar = false,
}: LayoutPropsType) => {
  const [fetchSchemas] = useManualQuery(SCHEMAS_QUERY);
  const [fetchCloudContext] = useManualQuery(`{ wbCloudContext }`);
  const [fetchSchemaTable] = useManualQuery(SCHEMA_TABLE_BY_NAME_QUERY);

  useEffect(() => {
    const fetchSchemasData = async () => {
      const { data } = await fetchSchemas();
      actions.setSchemas(data.wbMySchemas);
    };
    if (schemas.length < 1) fetchSchemasData();
  }, [actions, fetchSchemas, schemas.length]);

  useEffect(() => {
    const fetchCloud = async () => {
      const { data } = await fetchCloudContext();
      return data;
    };
    if (isObjectEmpty(cloudContext))
      fetchCloud().then(data => actions.setCloudContext(data.wbCloudContext));
  }, [actions, cloudContext, fetchCloudContext]);

  const fetchTableAndColumns = async () => {
    const { data } = await fetchSchemaTable({
      variables: {
        schemaName: schema.name,
        tableName: table.name,
        withColumns: true,
        withSettings: true,
      },
    });
    actions.setTable(data.wbMyTableByName);
    if (data.wbMyTableByName.columns.length > 0) {
      actions.setColumns(data.wbMyTableByName.columns);
      actions.setOrderBy(data.wbMyTableByName.columns[0].name);
      if (data.wbMyTableByName.settings) {
        actions.setViews(data.wbMyTableByName.settings.views);
        actions.setDefaultView(data.wbMyTableByName.settings.defaultView);
      }
    } else {
      actions.setColumns([]);
    }
  };

  return (
    <>
      <Header
        setFormData={actions.setFormData}
        setShow={actions.setShow}
        setType={actions.setType}
      />
      <div className="mt-5">
        {!hideSidebar && (
          <Sidebar
            setFormData={actions.setFormData}
            setShow={actions.setShow}
            setType={actions.setType}
          />
        )}
        <main id="main" style={{ marginLeft: !hideSidebar ? '250px' : '0' }}>
          {children}
          <LayoutSidePanel fetchTables={fetchTableAndColumns} />
        </main>
      </div>
    </>
  );
};

Layout.defaultProps = defaultProps;

const mapStateToProps = state => ({
  schemas: state.schemas,
  schema: state.schema,
  table: state.table,
  cloudContext: state.cloudContext,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuthenticationRequired(Layout));
