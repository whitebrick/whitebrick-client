import React, { useState } from 'react';
import {
  FaChevronRight,
  FaDatabase,
  FaPen,
  FaPlus,
  FaUsers,
} from 'react-icons/fa';
import { bindActionCreators } from 'redux';
import { actions } from '../state/actions';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import NotFound from './notFound';
import { useMutation } from 'graphql-hooks';
import {
  REMOVE_USERS__MUTATION,
  SET_USERS_ROLE_MUTATION,
  UPDATE_ORGANIZATION_MUTATION,
} from '../graphql/mutations/wb';
import OrganizationMembers from './organization/members';
import SidePanel from './sidePanel';
import { OrganizationItemType } from '../types';
import UserSearchInput from './common/userInput';
import Tabs from './elements/tabs';
import Databases from './common/databases';

type OrganizationLayoutPropsType = {
  organization: OrganizationItemType;
  fetchOrganization: () => any;
  cloudContext: any;
  actions: any;
};

const OrganizationLayout = ({
  organization,
  fetchOrganization = () => {},
  cloudContext,
  actions,
}: OrganizationLayoutPropsType) => {
  const [updateUserRoleMutation] = useMutation(SET_USERS_ROLE_MUTATION);
  const [removeUserMutation] = useMutation(REMOVE_USERS__MUTATION);
  const [updateOrganizationMutation] = useMutation(
    UPDATE_ORGANIZATION_MUTATION,
  );
  const [show, setShow] = useState(false);
  const [type, setType] = useState('');
  const [data, setData] = useState<any>({});

  const getUserLevel = role => {
    return cloudContext.roles.organizations[role];
  };

  const fetchOrgData = async () => {
    const { loading: l, error: e, data } = await fetchOrganization();
    if (!l && !e) {
      let org = data['wbMyOrganizationByName'];
      if (org !== null) {
        org.users = [];
        org.users = data['wbOrganizationUsers'];
        actions.setOrganization(org);
      }
    }
    setShow(false);
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

  const handleUserRoleChange = async (userRole, user) => {
    const { loading, error } = await inviteUserOrUpdateRole(userRole, [
      user.email,
    ]);
    if (!loading && !error) fetchOrgData();
  };

  const onSave = async () => {
    if (type === 'invite') {
      const { loading, error } = await inviteUserOrUpdateRole(data.role, [
        data.user[0].email,
      ]);
      if (!loading && !error) fetchOrgData();
    } else {
      let variables: any = { name: organization.name };
      if (organization.name !== data.name) variables.newName = data.name;
      if (organization.label !== data.label) variables.newLabel = data.label;
      const { loading, error } = await updateOrganizationMutation({
        variables,
      });
      if (!loading && !error) fetchOrgData();
    }
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
            className="mt-4 w-50"
            aria-hidden={true}
            style={{ cursor: 'pointer' }}>
            <span>
              {organization.label}
              {organization['userRole'] === 'organization_administrator' && (
                <FaPen
                  className="ml-1"
                  size="14px"
                  aria-hidden="true"
                  onClick={() => {
                    setData(organization);
                    setShow(true);
                    setType('edit');
                  }}
                />
              )}
            </span>
          </h3>
          <div className="mt-4">
            <Tabs
              items={[
                {
                  title: (
                    <div>
                      <FaDatabase /> Databases
                    </div>
                  ),
                  element: (
                    <Databases
                      organization={organization}
                      setShow={setShow}
                      setType={setType}
                      renderTitle={false}
                    />
                  ),
                },
                {
                  title: (
                    <div>
                      <FaUsers /> People
                    </div>
                  ),
                  element: (
                    <OrganizationMembers
                      setData={setData}
                      setShow={setShow}
                      setType={setType}
                      organization={organization}
                      getUserLevel={getUserLevel}
                      handleUserRoleChange={handleUserRoleChange}
                      removeUser={removeUser}
                    />
                  ),
                },
              ]}
            />
          </div>
        </div>
        <SidePanel
          show={show}
          setShow={setShow}
          onSave={onSave}
          name={
            type === 'invite'
              ? `Invite user to ${organization.label}`
              : `Update '${organization.label}'`
          }>
          {type === 'invite' ? (
            <div className="form-group">
              <div className="mt-3">
                <UserSearchInput data={data} setData={setData} />
              </div>
              <div className="mt-3">
                <label htmlFor="role">Role</label>
                <select
                  className="form-control"
                  value={data.role}
                  onBlur={() => {}}
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
          ) : (
            <div className="form-group">
              <div className="mt-3">
                <label htmlFor="name">Name</label>
                <input
                  className="form-control"
                  value={data.name}
                  onChange={e => setData({ ...data, name: e.target.value })}
                />
              </div>
              <div className="mt-3">
                <label htmlFor="name">Label</label>
                <input
                  className="form-control"
                  value={data.label}
                  onChange={e => setData({ ...data, label: e.target.value })}
                />
              </div>
            </div>
          )}
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
