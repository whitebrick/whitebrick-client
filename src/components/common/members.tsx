import React, { useEffect, useState } from 'react';
import {
  Table,
  Select,
  Pill,
  IconButton,
  TrashIcon,
  LogOutIcon,
  SearchInput,
  Button,
  PlusIcon,
  HelpIcon,
  Tooltip,
} from 'evergreen-ui';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { useManualQuery, useMutation } from 'graphql-hooks';
import gravatar from 'gravatar';
import { actions } from '../../state/actions';
import {
  SCHEMA_SET_USER_ROLE_MUTATION,
  SET_USERS_ROLE_MUTATION,
  TABLE_SET_USER_ROLE_MUTATION,
  ORGANIZATION_REMOVE_USERS_MUTATION,
  SCHEMA_REMOVE_USER_ROLE_MUTATION,
  TABLE_REMOVE_USER_ROLE_MUTATION,
} from '../../graphql/mutations/wb';
import {
  OrganizationItemType,
  SchemaItemType,
  TableItemType,
} from '../../types';
import { isObjectEmpty } from '../../utils/objectEmpty';
import InviteUserModal from './inviteUserModal';
import RolePermissions from './rolePermissions';
import {
  ORGANIZATION_USERS_QUERY,
  SCHEMA_USERS_QUERY,
  TABLE_USERS_QUERY,
} from '../../graphql/queries/wb';
import { checkPermission } from '../../utils/checkPermission';

type MembersType = {
  user: any;
  users: any[];
  cloudContext: any;
  name: string;
  schema: SchemaItemType;
  table: TableItemType;
  organization: OrganizationItemType;
  actions: any;
};

const Members = ({
  user: u,
  users,
  cloudContext,
  name,
  schema,
  organization,
  table,
  actions,
}: MembersType) => {
  const getRole = role => {
    if (role) return role.split('_').pop();
    return null;
  };

  const [searchInput, setSearchInput] = useState('');
  const [show, setShow] = useState(false);
  const [showRoles, setShowRoles] = useState(false);

  const [updateSchemaUserRole] = useMutation(SCHEMA_SET_USER_ROLE_MUTATION);
  const [updateTableUserRole] = useMutation(TABLE_SET_USER_ROLE_MUTATION);
  const [updateOrganizationUserRole] = useMutation(SET_USERS_ROLE_MUTATION);

  const [removeOrganizationUserMutation] = useMutation(
    ORGANIZATION_REMOVE_USERS_MUTATION,
  );
  const [removeSchemaUserMutation] = useMutation(
    SCHEMA_REMOVE_USER_ROLE_MUTATION,
  );
  const [removeTableUserMutation] = useMutation(
    TABLE_REMOVE_USER_ROLE_MUTATION,
  );

  const cloudContextRoles = !isObjectEmpty(cloudContext) && cloudContext?.roles;
  const roles = !isObjectEmpty(cloudContext) && cloudContext?.roles[name];

  const getUserRole = () => {
    if (name === 'organization') return getRole(organization?.role?.name);
    if (name === 'schema') return getRole(schema?.role?.name);
    return getRole(table?.role?.name);
  };
  const userRole = getUserRole();

  const [fetchOrganizationUsers] = useManualQuery(ORGANIZATION_USERS_QUERY, {
    variables: {
      name: organization.name,
    },
  });
  const [fetchSchemaUsers] = useManualQuery(SCHEMA_USERS_QUERY, {
    variables: {
      schemaName: schema.name,
    },
  });
  const [fetchSchemaTableUsers] = useManualQuery(TABLE_USERS_QUERY, {
    variables: {
      schemaName: schema.name,
      tableName: table.name,
    },
  });

  const fetchUsers = () => {
    if (name === 'organization') {
      fetchOrganizationUsers().then(r =>
        actions.setUsers(r?.data?.wbOrganizationUsers),
      );
    } else if (name === 'schema') {
      fetchSchemaUsers().then(r => actions.setUsers(r?.data?.wbSchemaUsers));
    } else {
      fetchSchemaTableUsers().then(r =>
        actions.setUsers(r?.data?.wbTableUsers),
      );
    }
  };

  useEffect(fetchUsers, [
    actions,
    fetchOrganizationUsers,
    fetchSchemaTableUsers,
    fetchSchemaUsers,
    name,
  ]);

  const removeUser = async userEmail => {
    if (name === 'organization') {
      const { loading, error } = await removeOrganizationUserMutation({
        variables: {
          organizationName: organization.name,
          userEmails: [userEmail],
        },
      });
      if (!loading && !error) fetchUsers();
    } else if (name === 'schema') {
      const { loading, error } = await removeSchemaUserMutation({
        variables: {
          schemaName: schema.name,
          userEmails: [userEmail],
        },
      });
      if (!loading && !error) fetchUsers();
    } else {
      const { loading, error } = await removeTableUserMutation({
        variables: {
          schemaName: schema.name,
          tableName: table.name,
          userEmails: [userEmail],
        },
      });
      if (!loading && !error) fetchUsers();
    }
  };

  const handleUserRole = async (role, email) => {
    if (name === 'schema') {
      await updateSchemaUserRole({
        variables: {
          schemaName: schema.name,
          roleName: role,
          userEmails: [email],
        },
      });
    } else if (name === 'table') {
      await updateTableUserRole({
        variables: {
          schemaName: schema.name,
          tableName: table.name,
          roleName: role,
          userEmails: [email],
        },
      });
    } else {
      await updateOrganizationUserRole({
        variables: {
          organizationName: organization.name,
          roleName: role,
          userEmails: [email],
        },
      });
    }
    fetchUsers();
  };

  const renderRoleColumn = user => {
    if (userRole === 'administrator' || userRole === 'owner') {
      if (user.userEmail === u.email)
        return (
          <>
            {roles[user.role.name]?.label}
            <IconButton
              icon={LogOutIcon}
              appearance="primary"
              intent="danger"
              marginLeft={105}
            />
          </>
        );
      if (user.role.impliedFrom) return roles?.[user.role.name]?.label;
      return (
        <>
          <Select
            width="70%"
            value={user.role.name}
            onChange={e => handleUserRole(e.target.value, user.userEmail)}>
            {Object.keys(roles).map((role: string) => (
              <option key={role} value={role}>
                {roles[role].label}
              </option>
            ))}
          </Select>
          <IconButton
            icon={TrashIcon}
            appearance="primary"
            intent="danger"
            marginLeft={10}
            onClick={() => removeUser(user.userEmail)}
          />
        </>
      );
    }
    return roles && roles?.[user.role.name]?.label;
  };

  const filteredUsers =
    searchInput === ''
      ? users
      : users.filter(
          user =>
            user.userFirstName
              .toLowerCase()
              .includes(searchInput.toLowerCase()) ||
            user.userLastName
              .toLowerCase()
              .includes(searchInput.toLowerCase()) ||
            user.userEmail.toLowerCase().includes(searchInput.toLowerCase()),
        );

  const showInviteButton = () => {
    if (name === 'organization')
      return checkPermission(
        'manage_access_to_organization',
        organization?.role?.name,
      );
    if (name === 'schema')
      return checkPermission('manage_access_to_schema', schema?.role?.name);
    return checkPermission('manage_access_to_table', table?.role?.name);
  };

  return (
    <div>
      <div className="py-2">
        <SearchInput
          placeholder="Search Users"
          onChange={e => setSearchInput(e.target.value)}
          value={searchInput}
        />
        {showInviteButton() && (
          <div className="float-right">
            <Button
              appearance="primary"
              iconBefore={PlusIcon}
              onClick={() => setShow(true)}>
              Invite Users
            </Button>
          </div>
        )}
      </div>
      <Table>
        <Table.Head>
          <Table.TextHeaderCell>User</Table.TextHeaderCell>
          <Table.TextHeaderCell>Source</Table.TextHeaderCell>
          <Table.TextHeaderCell>
            Role{' '}
            <Tooltip content="Role permissions">
              <IconButton
                icon={HelpIcon}
                appearance="minimal"
                onClick={() => setShowRoles(true)}
              />
            </Tooltip>
          </Table.TextHeaderCell>
        </Table.Head>
        <Table.Body>
          {users &&
            users.length > 0 &&
            filteredUsers.map(user => (
              <Table.Row key={user.userId}>
                <Table.TextCell key={user.userId}>
                  <div className="d-flex align-items-center items-center">
                    <img
                      src={gravatar.url(user.userEmail)}
                      className="rounded-circle"
                      alt={`${user.firstName}'s profile pic`}
                    />
                    <div className="ml-3">
                      <h6>
                        {user.userFirstName} {user.userLastName}
                        {user.userEmail === u.email && (
                          <Pill display="inline-flex" marginLeft={8}>
                            it&apos;s you
                          </Pill>
                        )}
                      </h6>
                      <div className="text-black-50">{user.userEmail}</div>
                    </div>
                  </div>
                </Table.TextCell>
                <Table.TextCell>
                  {user.role.impliedFrom
                    ? `Implicitly Assigned from ${
                        cloudContextRoles &&
                        cloudContextRoles[user.role.impliedFrom.split('_')[0]][
                          user.role.impliedFrom
                        ].label
                      }`
                    : 'Explicitly Assigned'}
                </Table.TextCell>
                <Table.TextCell>{renderRoleColumn(user)}</Table.TextCell>
              </Table.Row>
            ))}
        </Table.Body>
      </Table>
      <InviteUserModal show={show} setShow={setShow} name={name} />
      <RolePermissions
        show={showRoles}
        setShow={setShowRoles}
        name={name}
        cloudContext={cloudContext}
      />
    </div>
  );
};

const mapStateToProps = state => ({
  cloudContext: state.cloudContext,
  organization: state.organization,
  schema: state.schema,
  table: state.table,
  user: state.user,
  users: state.users,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Members);
