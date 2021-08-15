import React, { useState } from 'react';
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
import { actions } from '../../state/actions';
import Tabs from '../elements/tabs';
import OrganizationDatabasesList from '../dashboard/organizationDatabasesList';
import Members from '../common/members';
import DeleteModal from '../common/deleteModal';

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
  const [showDelete, setShowDelete] = useState(false);

  const deleteOrganization = () => {
    setShowDelete(true);
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
                      onClick={() => deleteOrganization()}
                    />
                    {showDelete && (
                      <DeleteModal
                        show={showDelete}
                        setShow={setShowDelete}
                        type="organization"
                        org={organization}
                      />
                    )}
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
