import React, { useEffect } from 'react';
import {
  Button,
  IconButton,
  ChevronRightIcon,
  ChevronLeftIcon,
  Tooltip,
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
      style={{ width: expand ? '250px' : '3.5rem' }}>
      <aside className="p-0">
        <Orgs expand={expand} />
        <div className="list-group mt-4">
          <DatabaseSettings expand={expand} />
          <DebugSettings expand={expand} setExpand={setExpand} />
        </div>
      </aside>
      <div
        className="list-group-item p-1 d-flex align-items-center"
        style={{ bottom: '0' }}>
        {expand ? (
          <Button
            size="large"
            iconBefore={ChevronLeftIcon}
            appearance="minimal"
            onClick={() => setExpand(false)}>
            collapse
          </Button>
        ) : (
          <Tooltip content="Expand sidebar">
            <IconButton
              size="large"
              icon={ChevronRightIcon}
              appearance="minimal"
              onClick={() => setExpand(true)}
            />
          </Tooltip>
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
