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
import { checkPermission } from '../../utils/checkPermission';

type OrganizationLayoutPropsType = {
  organization: any;
  actions: any;
  cloudContext: any;
};

const OrganizationLayout = ({
  organization,
  actions,
  cloudContext,
}: OrganizationLayoutPropsType) => {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div className="ag-theme-alpine">
      <div className="my-3">
        <div style={{ padding: `1rem` }}>
          <p>
            <Link to="/">Home</Link> <ChevronRightIcon />{' '}
            <Link to={`/${organization.name}`}>{organization.label}</Link>
          </p>
          <div className="d-flex mt-4 ml-1">
            <h3 className="w-50" aria-hidden style={{ cursor: 'pointer' }}>
              <span>
                {organization.label}
                {checkPermission(
                  'administer_organization',
                  organization?.role?.name,
                  cloudContext,
                ) && (
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
                      onClick={() => setShowDelete(true)}
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
                  element: <Members name="organization" />,
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
  cloudContext: state.cloudContext,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuthenticationRequired(OrganizationLayout));
