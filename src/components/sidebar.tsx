import React, { useEffect } from 'react';
import {
  FaUsers,
  FaCog,
  FaPlus,
  FaTrash,
  FaSync,
  FaKeycdn,
} from 'react-icons/fa';
import { navigate } from 'gatsby';
import { useAuth0 } from '@auth0/auth0-react';
import { bindActionCreators } from 'redux';
import { actions } from '../state/actions';
import { connect } from 'react-redux';
import { useManualQuery, useMutation } from 'graphql-hooks';
import { REMOVE_OR_DELETE_TABLE_MUTATION } from '../graphql/mutations/wb';
import { OrganizationItemType, SchemaItemType, TableItemType } from '../types';
import { ORGANIZATIONS_QUERY } from '../graphql/queries/wb';

type SidebarPropsType = {
  setFormData: (value: any) => void;
  setType: (value: string) => void;
  setShow: (value: boolean) => void;
  schema: SchemaItemType;
  table: TableItemType;
  organizations: Array<OrganizationItemType>;
  actions: any;
  sendAdminSecret: boolean;
};

const Sidebar = ({
  setFormData,
  setType,
  setShow,
  schema,
  table,
  organizations,
  sendAdminSecret,
  actions,
}: SidebarPropsType) => {
  const { getAccessTokenSilently, getIdTokenClaims } = useAuth0();
  const [removeOrDeleteTableMutation] = useMutation(
    REMOVE_OR_DELETE_TABLE_MUTATION,
  );
  const [fetchOrganizations] = useManualQuery(ORGANIZATIONS_QUERY);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await fetchOrganizations();
      actions.setOrganizations(data?.wbMyOrganizations);
    };
    fetchData();
  }, [actions, fetchOrganizations]);

  const deleteTable = async () => {
    actions.setTable('');
    await removeOrDeleteTableMutation({
      variables: {
        schemaName: schema.name,
        tableName: table.name,
        del: true,
      },
    });
  };

  const handleRefreshToken = async () => {
    await getAccessTokenSilently({ ignoreCache: true });
    const tokenClaims = await getIdTokenClaims();
    actions.setAccessToken(tokenClaims['__raw']);
    actions.setTokenClaims(tokenClaims);
  };

  return (
    <div className="row m-0" id="sidebar">
      <aside className="p-0">
        {organizations && organizations.length > 0 && (
          <div className="list-group mt-4">
            <div className="sidebar-heading list-group-item">Organizations</div>
            {organizations.map(organization => (
              <div
                onClick={() => navigate(`/${organization.name}`)}
                aria-hidden="true"
                className={`list-group-item py-1`}
                key={organization.name}>
                <FaUsers /> {organization.label.toLowerCase()}
              </div>
            ))}
            <div
              className="list-group-item py-1 d-flex align-items-center"
              aria-hidden="true"
              style={{ color: '#5E6A7B' }}
              onClick={() => {
                setShow(true);
                setType('organization');
              }}>
              <FaPlus size="14px" />
              <span className="ml-2">Add an organization</span>
            </div>
          </div>
        )}
        <div className="list-group">
          {Object.keys(schema).length > 0 && (
            <React.Fragment>
              <div className="sidebar-heading mt-2 list-group-item">
                Database Settings
              </div>
              <div
                onClick={() => {
                  setShow(true);
                  setType('table');
                  setFormData({ schema });
                }}
                aria-hidden="true"
                className="list-group-item py-1 d-flex align-items-center">
                <FaPlus size="14px" /> <span className="ml-2">New table</span>
              </div>
              <div className="list-group-item py-1 d-flex align-items-center">
                <FaCog size="14px" /> <span className="ml-2">Settings</span>
              </div>
              <div className="list-group-item py-1 d-flex align-items-center">
                <FaUsers size="14px" />{' '}
                <span className="ml-2">Invite others</span>
              </div>
              {table.name && (
                <div
                  className="list-group-item py-1 d-flex align-items-center"
                  aria-hidden="true"
                  onClick={deleteTable}>
                  <FaTrash size="14px" />{' '}
                  <div className="ml-2">
                    Delete '{table.label.toLowerCase()}'
                  </div>
                </div>
              )}
            </React.Fragment>
          )}
          {process.env.NODE_ENV === 'development' && (
            <React.Fragment>
              <div className="sidebar-heading list-group-item mt-2">
                Debug Settings
              </div>
              <div
                className="list-group-item btn py-1 d-flex align-items-center"
                aria-hidden="true"
                onClick={() => {
                  setShow(true);
                  setType('token');
                }}>
                <FaKeycdn size="14px" />{' '}
                <span className="ml-2">Display Token</span>
              </div>
              <div
                className="list-group-item btn py-1 d-flex align-items-center"
                aria-hidden="true"
                onClick={handleRefreshToken}>
                <FaSync size="14px" />{' '}
                <span className="ml-2">Refresh Token</span>
              </div>
              <div
                className="list-group-item btn py-1 d-flex align-items-center"
                aria-hidden="true"
                onClick={() => actions.setSendAdminSecret(!sendAdminSecret)}>
                <input
                  type="checkbox"
                  checked={sendAdminSecret}
                  onChange={e => actions.setSendAdminSecret(e.target.checked)}
                />
                <span className="ml-2">Send Admin Secret</span>
              </div>
            </React.Fragment>
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
