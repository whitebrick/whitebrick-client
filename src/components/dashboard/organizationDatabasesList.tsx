import React, { useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { TrashIcon, IconButton } from 'evergreen-ui';
import { actions } from '../../state/actions';
import { OrganizationItemType, SchemaItemType } from '../../types';
import NoData from '../common/noData';
import AddData from '../common/addData';
import DeleteModal from '../common/deleteModal';
import { checkPermission } from '../../utils/checkPermission';
import ContextItem from '../common/contextItem';

type DatabasesPropsType = {
  organization: OrganizationItemType;
  schemas: SchemaItemType[];
  renderTitle?: boolean;
};

const defaultProps = {
  renderTitle: true,
};

const OrganizationDatabasesList = ({
  organization,
  schemas,
  renderTitle = true,
}: DatabasesPropsType) => {
  const [showDelete, setShowDelete] = useState(false);

  const isOrgAdmin = checkPermission(
    'administer_organization',
    organization?.role?.name,
  );

  return (
    <div className="card my-4">
      {renderTitle && (
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6>{organization.label}</h6>
          {isOrgAdmin && (
            <div>
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
            </div>
          )}
        </div>
      )}
      <div className="card-body">
        {schemas.filter(
          schema => schema.organizationOwnerName === organization.name,
        ).length > 0 ? (
          <div className="row">
            {schemas
              .filter(
                schema => schema.organizationOwnerName === organization.name,
              )
              .map(schema => (
                <ContextItem
                  type="database"
                  singleSchema={schema}
                  organization={organization}
                />
              ))}
            <AddData
              name="database"
              type="createDatabase"
              permissionType="administer_organization"
              extraParams={{ organization }}
            />
          </div>
        ) : (
          <NoData type="createDatabase" name="database" bg="transparent" />
        )}
      </div>
    </div>
  );
};

OrganizationDatabasesList.defaultProps = defaultProps;
const mapStateToProps = state => ({
  schemas: state.schemas,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuthenticationRequired(OrganizationDatabasesList));
