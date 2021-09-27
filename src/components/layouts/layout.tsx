import React, { useEffect, useState } from 'react';
import { useManualQuery } from 'graphql-hooks';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { actions } from '../../state/actions';
import Sidebar from '../sidebar';
import { SCHEMAS_QUERY } from '../../graphql/queries/wb';
import Header from '../elements/header';
import { SchemaItemType } from '../../types';
import { isObjectEmpty } from '../../utils/objectEmpty';
import SidePanelForm from '../common/sidePanelForm';

type LayoutPropsType = {
  schemas: SchemaItemType[];
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
  children,
  actions,
  cloudContext,
  hideSidebar = false,
}: LayoutPropsType) => {
  const [expand, setExpand] = useState(false);
  const [fetchSchemas] = useManualQuery(SCHEMAS_QUERY);
  const [fetchCloudContext] = useManualQuery(`{ wbCloudContext }`);

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

  const getMarginLeft = (hideSidebar: boolean, expand: boolean) => {
    if (!hideSidebar) {
      if (expand) return '250px';
      return '3.5rem';
    }
    return 0;
  };

  return (
    <>
      <Header />
      <div className="mt-5">
        {!hideSidebar && <Sidebar expand={expand} setExpand={setExpand} />}
        <main
          id="main"
          style={{
            marginLeft: getMarginLeft(hideSidebar, expand),
          }}>
          {children}
          <SidePanelForm />
        </main>
      </div>
    </>
  );
};

Layout.defaultProps = defaultProps;

const mapStateToProps = state => ({
  schemas: state.schemas,
  cloudContext: state.cloudContext,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuthenticationRequired(Layout));
