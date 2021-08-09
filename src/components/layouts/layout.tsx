import React, { useEffect } from 'react';
import { useManualQuery } from 'graphql-hooks';
import { bindActionCreators } from 'redux';
import { actions } from '../../state/actions';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import Sidebar from '../sidebar';
import { SCHEMAS_QUERY, SCHEMA_TABLES_QUERY } from '../../graphql/queries/wb';
import Header from '../common/header';
import { SchemaItemType, TableItemType } from '../../types';
import { isObjectEmpty } from '../../utils/objectEmpty';
import TableLayout from './tableLayout';
import LayoutSidePanel from '../../components/common/layoutSidePanel';

type LayoutPropsType = {
  schemas: SchemaItemType[];
  table: TableItemType;
  schema: SchemaItemType;
  children?: React.ReactNode;
  user: any;
  actions: any;
  cloudContext: any;
  hideSidebar?: boolean;
};

const Layout = ({
  schemas,
  table,
  schema,
  children,
  user,
  actions,
  cloudContext,
  hideSidebar = false,
}: LayoutPropsType) => {
  const [fetchSchemas] = useManualQuery(SCHEMAS_QUERY);
  const [fetchCloudContext] = useManualQuery(`{ wbCloudContext }`);
  const [fetchSchemaTables] = useManualQuery(SCHEMA_TABLES_QUERY);

  const fetchSchemasData = async () => {
    const { data } = await fetchSchemas();
    actions.setSchemas(data.wbMySchemas);
  };

  useEffect(() => {
    if (schemas.length < 1) fetchSchemasData();
  }, []);

  useEffect(() => {
    const fetchCloud = async () => {
      const { data } = await fetchCloudContext();
      return data;
    };
    if (isObjectEmpty(cloudContext))
      fetchCloud().then(data =>
        actions.setCloudContext(data['wbCloudContext']),
      );
  }, []);

  const fetchTablesAndColumns = async () => {
    const { data } = await fetchSchemaTables({
      variables: {
        schemaName: schema.name,
        withColumns: true,
        withSettings: true,
      },
    });
    actions.setTables(data.wbMyTables);
    let t = data.wbMyTables.filter(
      tableName => tableName.name === table.name,
    )[0];
    if (t.columns.length > 0) {
      actions.setColumns(t.columns);
      actions.setOrderBy(t.columns[0].name);
      actions.setViews(t.settings.views);
      actions.setDefaultView(t.settings.defaultView);
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
          <LayoutSidePanel fetchTables={fetchTablesAndColumns} />
        </main>
      </div>
    </>
  );
};

const mapStateToProps = state => ({
  schemas: state.schemas,
  schema: state.schema,
  table: state.table,
  user: state.user,
  cloudContext: state.cloudContext,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuthenticationRequired(Layout));
