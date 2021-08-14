import React from 'react';
import {
  ChevronRightIcon,
  EditIcon,
  IconButton,
  TrashIcon,
} from 'evergreen-ui';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { Link } from 'gatsby';
import { useMutation } from 'graphql-hooks';
import { actions } from '../../state/actions';
import Tabs from '../elements/tabs';
import OrganizationDatabasesList from '../dashboard/organizationDatabasesList';
import Members from '../common/members';
import { DELETE_ORGANIZATION_MUTATION } from '../../graphql/mutations/wb';

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
  const [deleteOrganizationMutation] = useMutation(
    DELETE_ORGANIZATION_MUTATION,
  );
  const deleteOrganization = async () => {
    await deleteOrganizationMutation({
      variables: { name: organization.name },
    });
  };

  return (
    <div className="ag-theme-alpine">
      <div className="my-3">
        <div style={{ padding: `1rem` }}>
          <p>
            <Link to="/">Home</Link> <ChevronRightIcon />{' '}
            <Link to={`/${organization.name}`}>{organization.label}</Link>
          </p>
          <div className="d-flex mt-4 ml-1">
            <h3 className="w-25" aria-hidden style={{ cursor: 'pointer' }}>
              <span>
                {organization.label}
                {organization?.role?.name === 'organization_administrator' && (
                  <span>
                    <IconButton
                      className="ml-1"
                      appearance="minimal"
                      icon={EditIcon}
                      onClick={() => {
                        actions.setFormData(organization);
                        actions.setShow(true);
                        actions.setType('editOrganization');
                      }}
                    />
                    <IconButton
                      appearance="minimal"
                      icon={TrashIcon}
                      onClick={() =>
                        deleteOrganization().finally(() =>
                          window.location.replace('/'),
                        )
                      }
                    />
                  </span>
                )}
              </span>
            </h3>
          </div>
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
