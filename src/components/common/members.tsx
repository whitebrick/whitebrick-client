import React, { useState } from 'react';
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
} from 'evergreen-ui';
import { bindActionCreators } from 'redux';
import { actions } from '../../state/actions';
import { connect } from 'react-redux';
import { useMutation } from 'graphql-hooks';
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

type MembersType = {
  user: any;
  users: any[];
  cloudContext: any;
  name: string;
  refetch: () => void;
  schema: SchemaItemType;
  table: TableItemType;
  organization: OrganizationItemType;
};

const Members = ({
  user: u,
  users,
  cloudContext,
  name,
  refetch,
  schema,
  organization,
  table,
}: MembersType) => {
  const getRole = role => {
    if (role) return role.split('_').pop();
  };

  const [searchInput, setSearchInput] = useState('');
  const [show, setShow] = useState(false);
  const roles = !isObjectEmpty(cloudContext) && cloudContext?.roles[name];
  const userRole =
    name === 'organization'
      ? getRole(organization?.role?.name)
      : name === 'schema'
      ? getRole(schema?.role?.name)
      : getRole(table?.role?.name);
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

  const removeUser = async userEmail => {
    if (name === 'organization') {
      const { loading, error } = await removeOrganizationUserMutation({
        variables: {
          organizationName: organization.name,
          userEmails: [userEmail],
        },
      });
      if (!loading && !error) refetch();
    } else if (name === 'schema') {
      const { loading, error } = await removeSchemaUserMutation({
        variables: {
          schemaName: schema.name,
          userEmails: [userEmail],
        },
      });
      if (!loading && !error) refetch();
    } else {
      const { loading, error } = await removeTableUserMutation({
        variables: {
          schemaName: schema.name,
          tableName: table.name,
          userEmails: [userEmail],
        },
      });
      if (!loading && !error) refetch();
    }
  };

  const renderRoleColumn = user => {
    if (userRole === 'administrator' || userRole === 'owner') {
      if (user.userEmail === u.email)
        return (
          <React.Fragment>
            {roles[user.role.name].label}
            <IconButton
              icon={LogOutIcon}
              appearance="primary"
              intent="danger"
              marginLeft={105}
            />
          </React.Fragment>
        );
      if (user.role.impliedFrom) return roles[user.role.name].label;
      return (
        <React.Fragment>
          <Select
            width="70%"
            value={user.role.name}
            onChange={e => handleUserRole(e.target.value, user.userEmail)}>
            {Object.keys(roles).map((role: string, index: number) => (
              <option key={index} value={role}>
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
        </React.Fragment>
      );
    } else {
      return roles[user.role.name].label;
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
    refetch();
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

  return (
    <div>
      <div className="py-2">
        <SearchInput
          placeholder="Search Users"
          onChange={e => setSearchInput(e.target.value)}
          value={searchInput}
        />
        <div className="float-right">
          <Button
            appearance="primary"
            iconBefore={PlusIcon}
            onClick={() => setShow(true)}>
            Invite Users
          </Button>
        </div>
      </div>
      <Table>
        <Table.Head>
          <Table.TextHeaderCell>User</Table.TextHeaderCell>
          <Table.TextHeaderCell>Source</Table.TextHeaderCell>
          <Table.TextHeaderCell>Role</Table.TextHeaderCell>
        </Table.Head>
        <Table.Body>
          {users &&
            users.length > 0 &&
            filteredUsers.map(user => (
              <Table.Row key={user.userId}>
                <Table.TextCell>
                  <div className="d-flex align-items-center items-center">
                    <img
                      src="https://www.gravatar.com/avatar/HASH"
                      className="rounded-circle"
                      alt="image"
                    />
                    <div className="ml-3">
                      <h6>
                        {user.userFirstName} {user.userLastName}
                        {user.userEmail === u.email && (
                          <Pill display="inline-flex" marginLeft={8}>
                            it's you
                          </Pill>
                        )}
                      </h6>
                      <div className="text-black-50">{user.userEmail}</div>
                    </div>
                  </div>
                </Table.TextCell>
                <Table.TextCell>
                  {user.role.impliedFrom
                    ? cloudContext.roles[user.role.impliedFrom.split('_')[0]][
                        user.role.impliedFrom
                      ].label
                    : 'Direct Member'}
                </Table.TextCell>
                <Table.TextCell>{renderRoleColumn(user)}</Table.TextCell>
              </Table.Row>
            ))}
        </Table.Body>
      </Table>
      <InviteUserModal
        show={show}
        setShow={setShow}
        name={name}
        refetch={refetch}
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
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Members);
