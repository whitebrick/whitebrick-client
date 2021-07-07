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
    <div style={{ overflow: 'scroll' }}>
      <div className="row p-4 d-flex align-items-center bg-white border">
        <div className="col-sm-1">
          <b>S.No</b>
        </div>
        <div className="col-sm-4">
          <b>Email</b>
        </div>
        <div className="col-sm-3">
          <b>Source</b>
        </div>
        <div className="col-sm-3">
          <b>Role</b>
        </div>
      </div>
      {organization.users.map((user, index) => (
        <div
          className="row p-3 d-flex align-items-center border"
          style={{
            background: index % 2 === 0 ? 'rgba(0, 0, 0, 0.05)' : 'white',
          }}>
          <div className="col-sm-1">
            <b>{index + 1}</b>
          </div>
          <div className="col-sm-4">
            <div>{user.userEmail}</div>
          </div>
          <div className="col-sm-3">
            <div>
              {user.roleImpliedFrom ? user.roleImpliedFrom : 'Direct Member'}
            </div>
          </div>
          <div className="col-sm-3">
            {organization['userRole'] === 'organization_administrator' ? (
              <select
                className="form-control-sm"
                onBlur={() => {}}
                value={user.role}
                onChange={e => handleUserRoleChange(e.target.value, user)}>
                <option value="organization_administrator">
                  Organization Administrator
                </option>
                <option value="organization_user">Organization User</option>
                <option value="organization_external_user">
                  Organization External User
                </option>
              </select>
            ) : (
              <div>{getUserLevel(user.role)['label']}</div>
            )}
          </div>
          <div className="col-sm-1">
            {organization['userRole'] === 'organization_administrator' &&
              user.role !== 'organization_administrator' && (
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => removeUser(user)}>
                  <FaTrash />
                </button>
              )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrganizationMembers;
