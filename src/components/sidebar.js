import React from 'react';
import {
  FaHome,
  FaUsers,
  FaCog,
  FaPlus,
  FaSearch,
  FaTrash,
  FaSync,
} from 'react-icons/fa';
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
  userShow,
  setUserShow,
  schemas,
  schema,
  tables,
  table,
  menuClass,
  actions,
}) => {
  const { user, logout, getIdTokenClaims, getAccessTokenSilently } = useAuth0();
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

  const handleTableClick = tableName => {
    if (tableName.columns.length > 0) {
      actions.setTable(tableName);
      actions.setColumns(tableName.columns);
      actions.setOrderBy(tableName.columns[0].name);
    } else {
      actions.setIsNewTable(true);
      actions.setTable(tableName);
      actions.setColumns([]);
    }
  };

  const handleRefreshToken = async () => {
    const token = await getAccessTokenSilently();
    const tokenClaims = await getIdTokenClaims();
    actions.setAccessToken(token);
    actions.setTokenClaims(tokenClaims);
  };

  return (
    <div className="row m-0" id="sidebar">
      <aside className="col-3 p-0 sidebar-collapsed">
        <div
          className="px-4 pt-4"
          aria-hidden="true"
          onClick={() => {
            actions.setSchema('');
            actions.setTable('');
          }}>
          <FaHome color="white" size="24px" />
        </div>
        <div className="px-4 pt-4" aria-hidden="true">
          <FaSearch color="white" size="24px" />
        </div>
        <div
          onClick={() => {
            setFormData({});
            setType('');
            setShow(true);
          }}
          aria-hidden="true"
          className="btn px-4 pt-4">
          <FaPlus color="white" size="24px" />
        </div>
        <div className="p-4" style={{ position: 'absolute', bottom: 0 }}>
          <div className="pb-4" aria-hidden="true">
            <FaCog color="white" size="24px" />
          </div>
          <div
            className="dropdown avatar"
            onClick={() => setUserShow(!userShow)}
            aria-hidden="true">
            <img src={user.picture} alt={user.nickname} />
            <div className={menuClass}>
              <button className="dropdown-item" aria-hidden="true">
                Settings
              </button>
              <button
                className="dropdown-item"
                onClick={() => logout({ returnTo: window.location.origin })}
                aria-hidden="true">
                Log out
              </button>
            </div>
          </div>
        </div>
      </aside>
      <aside className="col-9 p-0">
        {schema !== '' ||
          (schema !== undefined && (
            <div className="list-group w-100 rounded-0 mt-4">
              <div className="sidebar-heading list-group-item">Databases</div>
              {schemas.wbSchemas.map(field => (
                <div
                  onClick={() => actions.setSchema(field)}
                  aria-hidden="true"
                  className={`list-group-item py-1 ${
                    table === field.name && 'active'
                  }`}
                  key={field.name}>
                  {field.label}
                </div>
              ))}
            </div>
          ))}
        {schema && (
          <div className="list-group w-100 rounded-0 mt-4">
            <div className="sidebar-heading list-group-item">
              {schema.label}
            </div>
            {tables &&
              tables.map(tableName => (
                <div
                  onClick={() => handleTableClick(tableName)}
                  aria-hidden="true"
                  className={`list-group-item py-1 ${
                    table.name === tableName.name && 'active'
                  }`}
                  key={tableName.name}>
                  {tableName.label.toLowerCase()}
                </div>
              ))}
          </div>
        )}
        <div
          className="list-group"
          style={{ position: 'absolute', bottom: '20px' }}>
          {schema && (
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
  tables: state.tables,
  table: state.table,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
