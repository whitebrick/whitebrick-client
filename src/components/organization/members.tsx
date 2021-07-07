import React from 'react';
import { FaTrash } from 'react-icons/fa';

type OrganizationMembersPropsType = {
  organization: any;
  handleUserRoleChange: (value: string, user: any) => void;
  getUserLevel: (value: string) => any;
  removeUser: (user: any) => void;
};

const OrganizationMembers = ({
  organization,
  handleUserRoleChange,
  getUserLevel,
  removeUser,
}: OrganizationMembersPropsType) => {
  return (
    <div className="table-responsive mt-3">
      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Email</th>
            <th scope="col">Source</th>
            <th scope="col">Role</th>
          </tr>
        </thead>
        <tbody>
          {organization.users.map((user, index) => (
            <tr>
              <th scope="row">{index + 1}</th>
              <td>{user.userEmail}</td>
              <td>
                {user.roleImpliedFrom ? user.roleImpliedFrom : 'Direct Member'}
              </td>
              <td>
                {organization['userRole'] === 'organization_administrator' ? (
                  <React.Fragment>
                    <select
                      className="form-control-sm"
                      onBlur={() => {}}
                      value={user.role}
                      onChange={e =>
                        handleUserRoleChange(e.target.value, user)
                      }>
                      <option value="organization_administrator">
                        Organization Administrator
                      </option>
                      <option value="organization_user">
                        Organization User
                      </option>
                      <option value="organization_external_user">
                        Organization External User
                      </option>
                    </select>
                    {user.role !== 'organization_administrator' && (
                      <button
                        className="btn ml-3 btn-sm btn-danger"
                        onClick={() => removeUser(user)}>
                        <FaTrash />
                      </button>
                    )}
                  </React.Fragment>
                ) : (
                  <div>{getUserLevel(user.role)['label']}</div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrganizationMembers;
