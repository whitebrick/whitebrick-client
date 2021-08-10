import React, { useState } from 'react';
import { FaChevronRight, FaPen } from 'react-icons/fa';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { useMutation } from 'graphql-hooks';
import { Link } from 'gatsby';
import { actions } from '../../state/actions';
import { SET_USERS_ROLE_MUTATION } from '../../graphql/mutations/wb';
import SidePanel from '../elements/sidePanel';
import UserSearchInput from '../elements/userInput';
import Tabs from '../elements/tabs';
import OrganizationDatabasesList from '../dashboard/organizationDatabasesList';
import Members from '../common/members';

type OrganizationLayoutPropsType = {
  organization: any;
  show: boolean;
  type: string;
  refetch: () => void;
  actions: any;
};

const OrganizationLayout = ({
  organization,
  refetch,
  show,
  type,
  actions,
}: OrganizationLayoutPropsType) => {
  const [updateUserRoleMutation] = useMutation(SET_USERS_ROLE_MUTATION);
  const [data, setData] = useState<any>({});

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

  const onSave = async () => {
    if (type === 'invite') {
      const { loading, error } = await inviteUserOrUpdateRole(data.role, [
        data.user[0].email,
      ]);
      if (!loading && !error) {
        refetch();
        actions.setShow(false);
      }
    }
  };

  return (
    <div className="ag-theme-alpine">
      <div className="my-3">
        <div style={{ padding: `1rem` }}>
          <p>
            <Link to="/">Home</Link> <FaChevronRight />{' '}
            <Link to={`/${organization.name}`}>{organization.label}</Link>
          </p>
          <h3 className="mt-4 w-25" aria-hidden style={{ cursor: 'pointer' }}>
            <span>
              {organization.label}
              {organization?.role?.name === 'organization_administrator' && (
                <FaPen
                  className="ml-1"
                  size="14px"
                  aria-hidden="true"
                  onClick={() => {
                    actions.setFormData(organization);
                    actions.setShow(true);
                    actions.setType('editOrganization');
                  }}
                />
              )}
            </span>
          </h3>
          <div className="mt-4">
            <Tabs
              items={[
                {
                  title: 'Databases',
                  element: (
                    <OrganizationDatabasesList
                      organization={organization}
                      renderTitle={false}
                    />
                  ),
                },
                {
                  title: 'Members',
                  element: (
                    <Members
                      name="organization"
                      refetch={refetch}
                      users={organization?.users}
                    />
                  ),
                },
              ]}
            />
          </div>
        </div>
        <SidePanel
          show={show}
          setShow={actions.setShow}
          onSave={onSave}
          name={type === 'invite' && `Invite user to ${organization.label}`}>
          {type === 'invite' && (
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
          )}
        </SidePanel>
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  organization: state.organization,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuthenticationRequired(OrganizationLayout));
