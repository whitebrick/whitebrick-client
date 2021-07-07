import React from 'react';
import { FaTrash, FaPlus, FaSearch } from 'react-icons/fa';

type OrganizationMembersPropsType = {
  organization: any;
  handleUserRoleChange: (value: string, user: any) => void;
  getUserLevel: (value: string) => any;
  removeUser: (user: any) => void;
  setData: (value: any) => void;
  setType: (value: string) => void;
  setShow: (value: boolean) => void;
};

const OrganizationMembers = ({
  organization,
  handleUserRoleChange,
  getUserLevel,
  removeUser,
  setData,
  setShow,
  setType,
}: OrganizationMembersPropsType) => {
  return (
    <div className="table-responsive mt-3">
      {organization['userRole'] === 'organization_administrator' && (
        <div className="row m-0 py-2">
          <div className="col-sm-3">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search users"
              />
              <div className="input-group-append">
                <span className="input-group-text">
                  <FaSearch />
                </span>
              </div>
            </div>
          </div>
          <div className="col-sm-2 offset-sm-7">
            <button
              className="btn btn-sm btn-primary mb-2 float-right"
              onClick={() => {
                setData({});
                setShow(true);
                setType('invite');
              }}>
              <FaPlus /> Invite User
            </button>
          </div>
        </div>
      )}
      <table className="mx-3 shadow-sm table">
        <thead className="table-head font-weight-bold">
          <tr>
            <th scope="col">User</th>
            <th scope="col">Source</th>
            <th scope="col">Role</th>
          </tr>
        </thead>
        <tbody className="bg-white whitespace-nowrap">
          {organization.users.map(user => (
            <tr>
              <td>
                <div className="d-flex align-items-center items-center">
                  <img
                    src="https://www.gravatar.com/avatar/HASH"
                    className="rounded-circle"
                    alt="image"
                  />
                  <div className="ml-3">
                    <h6>Name</h6>
                    <div className="text-black-50">{user.userEmail}</div>
                  </div>
                </div>
              </td>
              <td className="align-bottom">
                <p>
                  {user.roleImpliedFrom
                    ? user.roleImpliedFrom
                    : 'Direct Member'}
                </p>
              </td>
              <td className="align-middle">
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
