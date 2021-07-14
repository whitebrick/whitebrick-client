import React from 'react';
import { Table, Select } from 'evergreen-ui';
import { bindActionCreators } from 'redux';
import { actions } from '../../state/actions';
import { connect } from 'react-redux';
import { useMutation } from 'graphql-hooks';
import {
  SCHEMA_SET_USER_ROLE_MUTATION,
  TABLE_SET_USER_ROLE_MUTATION,
} from '../../graphql/mutations/wb';
import { SchemaItemType, TableItemType } from '../../types';

type MembersType = {
  user: any;
  users: any[];
  cloudContext: any;
  name: string;
  refetch: () => void;
  schema: SchemaItemType;
  table: TableItemType;
};

const Members = ({
  user: u,
  users,
  cloudContext,
  name,
  refetch,
  schema,
  table,
}: MembersType) => {
  const roles = cloudContext?.roles[name];
  const userRole = schema?.role.name.split('_').pop();
  const [updateSchemaUserRole] = useMutation(SCHEMA_SET_USER_ROLE_MUTATION);
  const [updateTableUserRole] = useMutation(TABLE_SET_USER_ROLE_MUTATION);

  const handleUserRole = async (role, email) => {
    if (name === 'schema') {
      await updateSchemaUserRole({
        variables: {
          schemaName: schema.name,
          roleName: role,
          userEmails: [email],
        },
      });
    } else {
      await updateTableUserRole({
        variables: {
          schemaName: schema.name,
          tableName: table.name,
          roleName: role,
          userEmails: [email],
        },
      });
    }
    refetch();
  };

  return (
    <Table>
      <Table.Head>
        <Table.TextHeaderCell>User</Table.TextHeaderCell>
        <Table.TextHeaderCell>Source</Table.TextHeaderCell>
        <Table.TextHeaderCell>Role</Table.TextHeaderCell>
      </Table.Head>
      <Table.Body height={240}>
        {users.map(user => (
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
                  </h6>
                  <div className="text-black-50">{user.userEmail}</div>
                </div>
              </div>
            </Table.TextCell>
            <Table.TextCell>
              {user.role.impliedFrom ? user.role.impliedFrom : 'Direct Member'}
            </Table.TextCell>
            <Table.TextCell>
              {userRole === 'administrator' || userRole === 'owner' ? (
                u.email === user.userEmail ? (
                  roles[user.role.name].label
                ) : user.role.impliedFrom ? (
                  roles[user.role.name].label
                ) : (
                  <Select
                    width="100%"
                    value={user.role.name}
                    onChange={e =>
                      handleUserRole(e.target.value, user.userEmail)
                    }>
                    {Object.keys(roles).map((role: string, index: number) => (
                      <option key={index} value={role}>
                        {roles[role].label}
                      </option>
                    ))}
                  </Select>
                )
              ) : (
                roles[user.role.name].label
              )}
            </Table.TextCell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

const mapStateToProps = state => ({
  cloudContext: state.cloudContext,
  schema: state.schema,
  table: state.table,
  user: state.user,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Members);
