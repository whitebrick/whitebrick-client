import React, { useState, useEffect } from 'react';
import {
  ApplicationIcon,
  RefreshIcon,
  KeyIcon,
  PlusIcon,
  CogIcon,
  TrashIcon,
  NewPersonIcon,
} from 'evergreen-ui';
import { useAuth0 } from '@auth0/auth0-react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { useManualQuery, useMutation } from 'graphql-hooks';
import { actions } from '../state/actions';
import {
  REMOVE_OR_DELETE_SCHEMA_MUTATION,
  REMOVE_OR_DELETE_TABLE_MUTATION,
} from '../graphql/mutations/wb';
import { OrganizationItemType, SchemaItemType, TableItemType } from '../types';
import { ORGANIZATIONS_QUERY } from '../graphql/queries/wb';
import DeleteModal from './common/deleteModal';

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

  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await fetchOrganizations();
      actions.setOrganizations(data?.wbMyOrganizations);
    };
    fetchData();
  }, [actions, fetchOrganizations]);

  const deleteTable = async () => {
    await removeOrDeleteTableMutation({
      variables: {
        schemaName: schema.name,
        tableName: table.name,
        del: true,
      },
    });
    actions.setTable('');
    window.location.replace('/');
  };

  const deleteSchema = () => {
    setShowDelete(true);
  };

  const handleRefreshToken = async () => {
    await getAccessTokenSilently({ ignoreCache: true });
    const tokenClaims = await getIdTokenClaims();
    actions.setAccessToken(tokenClaims.__raw);
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
                onClick={() => window.location.replace(`/${organization.name}`)}
                aria-hidden="true"
                className="list-group-item py-1"
                key={organization.name}>
                <ApplicationIcon /> {organization.label.toLowerCase()}
              </div>
            ))}
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
        )}
        <div className="list-group">
          {Object.keys(schema).length > 0 && (
            <>
              <div className="sidebar-heading mt-2 list-group-item">
                Database Settings
              </div>
              <div
                onClick={() => {
                  setShow(true);
                  setType('createTable');
                  setFormData({ schema });
                }}
                aria-hidden="true"
                className="list-group-item py-1 d-flex align-items-center">
                <PlusIcon /> <span className="ml-2">New table</span>
              </div>
              <div className="list-group-item py-1 d-flex align-items-center">
                <CogIcon /> <span className="ml-2">Settings</span>
              </div>
              <div className="list-group-item py-1 d-flex align-items-center">
                <NewPersonIcon /> <span className="ml-2">Invite others</span>
              </div>
              <div
                className="list-group-item py-1 d-flex align-items-center text-danger"
                aria-hidden="true"
                onClick={deleteSchema}>
                <TrashIcon />
                <div className="ml-2">Delete {schema.label}</div>
              </div>
              {showDelete && (
                <DeleteModal show={showDelete} setShow={setShowDelete} />
              )}
              {table.name && (
                <div
                  className="list-group-item py-1 d-flex align-items-center"
                  aria-hidden="true"
                  onClick={deleteTable}>
                  <TrashIcon />{' '}
                  <div className="ml-2">Delete {table.label.toLowerCase()}</div>
                </div>
              )}
            </>
          )}
          {process.env.NODE_ENV === 'development' && (
            <>
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
                <KeyIcon />
                <span className="ml-2">Display Token</span>
              </div>
              <div
                className="list-group-item btn py-1 d-flex align-items-center"
                aria-hidden="true"
                onClick={handleRefreshToken}>
                <RefreshIcon />
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
            </>
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
