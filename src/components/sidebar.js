import React from 'react';
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
import { actions } from '../actions';
import { connect } from 'react-redux';
import { useMutation } from 'graphql-hooks';
import { REMOVE_OR_DELETE_TABLE_MUTATION } from '../graphql/mutations/wb';

const Sidebar = ({
  setFormData,
  setType,
  setShow,
  schema,
  table,
  organizations,
  actions,
}) => {
  const { getAccessTokenSilently, getIdTokenClaims } = useAuth0();
  const [removeOrDeleteTableMutation] = useMutation(
    REMOVE_OR_DELETE_TABLE_MUTATION,
  );

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
    await getAccessTokenSilently({ ignoreCache: true, schema_name: schema.name });
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
                onClick={() => navigate(`/organization/${organization.name}`)}
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
          <div className="sidebar-heading list-group-item mt-2">Settings</div>
          <div
            className="list-group-item py-1 d-flex align-items-center"
            aria-hidden="true"
            onClick={() => {
              setShow(true);
              setType('token');
            }}>
            <FaKeycdn size="14px" /> <span className="ml-2">Display Token</span>
          </div>
          <div
            className="list-group-item py-1 d-flex align-items-center"
            aria-hidden="true"
            onClick={handleRefreshToken}>
            <FaSync size="14px" /> <span className="ml-2">Refresh Token</span>
          </div>
        </div>
      </aside>
    </div>
  );
};

const mapStateToProps = state => ({
  schema: state.schema,
  table: state.table,
  organizations: state.organizations,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
