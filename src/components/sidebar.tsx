import React, { useEffect } from 'react';
import { ApplicationIcon, PlusIcon } from 'evergreen-ui';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { useManualQuery } from 'graphql-hooks';
import { actions } from '../state/actions';
import { OrganizationItemType, SchemaItemType, TableItemType } from '../types';
import { ORGANIZATIONS_QUERY } from '../graphql/queries/wb';
import DebugSettings from './elements/debugSettings';
import DatabaseSettings from './elements/databaseSettings';

type SidebarPropsType = {
  setFormData: (value: any) => void;
  setType: (value: string) => void;
  setShow: (value: boolean) => void;
  schema: SchemaItemType;
  table: TableItemType;
  organizations: Array<OrganizationItemType>;
  actions: any;
};

const Sidebar = ({
  setFormData,
  setType,
  setShow,
  schema,
  table,
  organizations,
  actions,
}: SidebarPropsType) => {
  const [fetchOrganizations] = useManualQuery(ORGANIZATIONS_QUERY);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await fetchOrganizations();
      actions.setOrganizations(data?.wbMyOrganizations);
    };
    fetchData();
  }, [actions, fetchOrganizations]);

  return (
    <div className="row m-0" id="sidebar">
      <aside className="p-0">
        <div className="list-group mt-4">
          <div className="sidebar-heading list-group-item">Organizations</div>
          {organizations && organizations.length > 0 && (
            <div>
              {organizations.map(organization => (
                <div
                  onClick={() =>
                    window.location.replace(`/${organization.name}`)
                  }
                  aria-hidden="true"
                  className="list-group-item py-1"
                  key={organization.name}>
                  <ApplicationIcon /> {organization.label.toLowerCase()}
                </div>
              ))}
            </div>
          )}
          <div
            className="list-group-item py-1 d-flex align-items-center"
            aria-hidden="true"
            style={{ color: '#5E6A7B' }}
            onClick={() => {
              setShow(true);
              setType('createOrganization');
            }}>
            <PlusIcon />
            <span className="ml-2">Add an organization</span>
          </div>
        </div>
        <div className="list-group">
          {Object.keys(schema).length > 0 && (
            <DatabaseSettings
              setType={setType}
              setShow={setShow}
              setFormData={setFormData}
            />
          )}
          {process.env.NODE_ENV === 'development' && (
            <DebugSettings setType={setType} setShow={setShow} />
          )}
        </div>
      </aside>
    </div>
  );
};

const mapStateToProps = state => ({
  schema: state.schema,
  table: state.table,
  organizations: state.organizations,
  sendAdminSecret: state.sendAdminSecret,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
