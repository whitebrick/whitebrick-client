import React, { useEffect } from 'react';
import {
  Button,
  IconButton,
  ChevronRightIcon,
  ChevronLeftIcon,
} from 'evergreen-ui';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { useManualQuery } from 'graphql-hooks';
import { actions } from '../state/actions';
import { ORGANIZATIONS_QUERY } from '../graphql/queries/wb';
import DebugSettings from './common/sidebar/debugSettings';
import DatabaseSettings from './common/sidebar/databaseSettings';
import Orgs from './common/sidebar/orgs';

type SidebarPropsType = {
  expand: boolean;
  setExpand: (value: boolean) => void;
  actions: any;
};

const Sidebar = ({ expand, setExpand, actions }: SidebarPropsType) => {
  const [fetchOrganizations] = useManualQuery(ORGANIZATIONS_QUERY);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await fetchOrganizations();
      actions.setOrganizations(data?.wbMyOrganizations);
    };
    fetchData();
  }, [actions, fetchOrganizations]);

  return (
    <div
      className="row m-0"
      id="sidebar"
      style={{ width: expand ? '250px' : '80px' }}>
      <aside className="p-0">
        <Orgs expand={expand} />
        <div className="list-group mt-4">
          <DatabaseSettings expand={expand} />
          <DebugSettings expand={expand} setExpand={setExpand} />
        </div>
      </aside>
      <div
        className="list-group-item py-1 d-flex align-items-center"
        style={{ bottom: '10px' }}>
        {expand ? (
          <Button
            iconBefore={ChevronLeftIcon}
            appearance="minimal"
            onClick={() => setExpand(false)}>
            hide sidebar
          </Button>
        ) : (
          <IconButton
            icon={ChevronRightIcon}
            appearance="minimal"
            onClick={() => setExpand(true)}
          />
        )}
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  sendAdminSecret: state.sendAdminSecret,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
