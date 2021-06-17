import React, { useState } from 'react';
import { FaChevronRight, FaPen, FaPlus, FaUsers } from 'react-icons/fa';
import { bindActionCreators } from 'redux';
import { actions } from '../actions';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import NotFound from './notFound';
import { useMutation } from 'graphql-hooks';
import {
  REMOVE_USERS__MUTATION,
  SET_USERS_ROLE_MUTATION,
} from '../graphql/mutations/wb';
import OrganizationMembers from './organization/members';
import SidePanel from './sidePanel';

const OrganizationLayout = ({
  organization,
  fetchOrganization = () => {},
  cloudContext,
  actions,
}) => {
  const [updateUserRoleMutation] = useMutation(SET_USERS_ROLE_MUTATION);
  const [removeUserMutation] = useMutation(REMOVE_USERS__MUTATION);
  const [show, setShow] = useState(false);
  const [data, setData] = useState({});

  const getUserLevel = role => {
    return cloudContext.roles.organizations[role];
  };

  const fetchOrgData = async () => {
    const { loading: l, error: e, data } = await fetchOrganization();
    if (!l && !e) {
      let org = data['wbOrganizationByName'];
      if (org !== null) {
        org.users = [];
        org.users = data['wbOrganizationUsers'];
        actions.setOrganization(org);
      }
    }
  };

  const inviteUserOrUpdateRole = async (role, userEmails) => {
    const { loading, error } = await updateUserRoleMutation({
      variables: {
        organizationName: organization.name,
        role,
        userEmails,
      },
    });
    return { loading, error };
  };

  const handleUserRoleChange = (userRole, user) => {
    const { loading, error } = inviteUserOrUpdateRole(userRole, [user.email]);
    if (!loading && !error) fetchOrgData();
  };

  const onSave = () => {
    const { loading, error } = inviteUserOrUpdateRole(data.role, data.emails);
    if (!loading && !error) fetchOrgData();
  };

  const removeUser = async user => {
    const { loading, error } = await removeUserMutation({
      variables: {
        organizationName: organization.name,
        userEmails: [user.email],
      },
    });
    if (!loading && !error) fetchOrgData();
  };

  return Object.keys(organization).length !== 0 ? (
    <div className="ag-theme-alpine">
      <div className="my-3">
        <div style={{ padding: `1rem` }}>
          <p>
            Organizations <FaChevronRight /> {organization.label}
          </p>
          <h3
            className="mt-4 w-25"
            aria-hidden={true}
            style={{ cursor: 'pointer' }}>
            <span>
              {organization.label}
              <FaPen className="ml-1" size="15px" />
            </span>
          </h3>
          <div className="mt-4">
            {organization['userRole'] === 'organization_administrator' && (
              <div>
                <button
                  className="btn btn-outline-primary mb-2"
                  onClick={() => setShow(true)}>
                  <FaPlus /> Invite User
                </button>
              </div>
            )}
            <OrganizationMembers
              organization={organization}
              getUserLevel={getUserLevel}
              handleUserRoleChange={handleUserRoleChange}
              removeUser={removeUser}
            />
          </div>
        </div>
        <SidePanel
          show={show}
          setShow={setShow}
          onSave={onSave}
          name={`Invite user to ${organization.label}`}>
          <div className="form-group">
            <div className="mt-3">
              <label htmlFor="emails">User Email</label>
              <textarea
                className="form-control"
                value={data.emails && data?.emails.join(',')}
                onChange={e =>
                  setData({ ...data, emails: e.target.value.split(',') })
                }
              />
              <p className="text-small p-1">
                You can pass multiple emails with comma seperated
              </p>
            </div>
            <div className="mt-3">
              <label htmlFor="role">Role</label>
              <select
                className="form-control"
                value={data.role}
                onChange={e => setData({ ...data, role: e.target.value })}>
                <option selected disabled>
                  Select role
                </option>
                <option value="organization_administrator">
                  Organization Administrator
                </option>
                <option value="organization_user">Organization User</option>
                <option value="organization_external_user">
                  Organization External User
                </option>
              </select>
            </div>
          </div>
        </SidePanel>
      </div>
    </div>
  ) : (
    <NotFound name="Organization" />
  );
};

const mapStateToProps = state => ({
  organization: state.organization,
  cloudContext: state.cloudContext,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuthenticationRequired(OrganizationLayout));
