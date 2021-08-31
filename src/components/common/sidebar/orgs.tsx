import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Avatar,
  Button,
  IconButton,
  PlusIcon,
  ApplicationIcon,
  Tooltip,
} from 'evergreen-ui';
import { actions } from '../../../state/actions';
import { OrganizationItemType } from '../../../types';

type OrgsPropsType = {
  expand: boolean;
  organization: OrganizationItemType;
  organizations: OrganizationItemType[];
  actions: any;
};

const Orgs = ({
  expand,
  organization,
  organizations,
  actions,
}: OrgsPropsType) => {
  const renderBody = () => {
    if (expand) {
      return (
        <div className="list-group mt-4">
          <div className="sidebar-heading list-group-item">Organizations</div>
          {organizations && organizations.length > 0 && (
            <div>
              {organizations.map(org => (
                <div
                  onClick={() => window.location.replace(`/${org.name}`)}
                  aria-hidden="true"
                  className="list-group-item py-1"
                  key={org.name}>
                  <ApplicationIcon /> {org.label.toLowerCase()}
                </div>
              ))}
            </div>
          )}
          <div
            className="list-group-item py-1 d-flex align-items-center"
            aria-hidden="true"
            style={{ color: '#5E6A7B' }}
            onClick={() => {
              actions.setShow(true);
              actions.setType('createOrganization');
            }}>
            <PlusIcon />
            <span className="ml-2">Add an organization</span>
          </div>
        </div>
      );
    }
    return (
      <div className="list-group mt-4">
        <div className="sidebar-heading list-group-item p-1">Orgs</div>
        {organizations && organizations.length > 0 && (
          <div className="mt-2">
            {organizations.map(org => (
              <Button
                appearance="minimal"
                onClick={() => window.location.replace(`/${org.name}`)}
                className="my-2 list-group-item p-0"
                key={org.name}>
                <Avatar
                  name={org.label}
                  size={40}
                  hashValue={
                    org.label === organization?.label ? 'id_124' : 'id_125'
                  }
                />
              </Button>
            ))}
            <div className="p-2 d-flex align-items-center">
              <Tooltip content="Create Organization">
                <IconButton
                  size="large"
                  appearance="minimal"
                  icon={PlusIcon}
                  onClick={() => {
                    actions.setShow(true);
                    actions.setType('createOrganization');
                  }}
                />
              </Tooltip>
            </div>
          </div>
        )}
      </div>
    );
  };

  return renderBody();
};

const mapStateToProps = state => ({
  organization: state.organization,
  organizations: state.organizations,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Orgs);
