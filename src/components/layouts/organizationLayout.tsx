import React from 'react';
import { ChevronRightIcon, EditIcon } from 'evergreen-ui';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { Link } from 'gatsby';
import { actions } from '../../state/actions';
import Tabs from '../elements/tabs';
import OrganizationDatabasesList from '../dashboard/organizationDatabasesList';
import Members from '../common/members';

type OrganizationLayoutPropsType = {
  organization: any;
  refetch: () => void;
  actions: any;
};

const OrganizationLayout = ({
  organization,
  refetch,
  actions,
}: OrganizationLayoutPropsType) => {
  return (
    <div className="ag-theme-alpine">
      <div className="my-3">
        <div style={{ padding: `1rem` }}>
          <p>
            <Link to="/">Home</Link> <ChevronRightIcon />{' '}
            <Link to={`/${organization.name}`}>{organization.label}</Link>
          </p>
          <h3 className="mt-4 w-25" aria-hidden style={{ cursor: 'pointer' }}>
            <span>
              {organization.label}
              {organization?.role?.name === 'organization_administrator' && (
                <EditIcon
                  className="ml-1"
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
