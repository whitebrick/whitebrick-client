import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import Avatar from 'react-avatar';
import { navigate } from 'gatsby';
import { FaCog } from 'react-icons/fa';
import { AddIcon } from 'evergreen-ui';
import { actions } from '../../state/actions';
import { OrganizationItemType, SchemaItemType } from '../../types';

type DatabasesPropsType = {
  organization: OrganizationItemType;
  schemas: Array<SchemaItemType>;
  actions: any;
  renderTitle?: boolean;
};

const defaultProps = {
  renderTitle: true,
};

const OrganizationDatabasesList = ({
  organization,
  schemas,
  actions,
  renderTitle = true,
}: DatabasesPropsType) => {
  return (
    <div className="card my-4">
      {renderTitle && (
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6>{organization.label}</h6>
          <button
            type="submit"
            className="btn btn-sm btn-light"
            onClick={() => navigate(`/${organization.name}`)}>
            <FaCog />
          </button>
        </div>
      )}
      <div className="card-body">
        {schemas.filter(
          schema => schema.organizationOwnerName === organization.name,
        ).length === 0 ? (
          <div className="row">
            <div className="col-md-6 offset-md-4">
              <div
                className="text-center rounded p-2"
                style={{ backgroundColor: '#ececec', width: '60%' }}>
                <p>You do not have any databases yet.</p>
                <div
                  aria-hidden
                  onClick={() => {
                    actions.setFormData({});
                    actions.setType('createDatabase');
                    actions.setShow(true);
                  }}>
                  <AddIcon color="info" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="row">
            {schemas
              .filter(
                schema => schema.organizationOwnerName === organization.name,
              )
              .map(schema => (
                <div
                  key={schema.name}
                  className="col-md-2 col-sm-6 text-center btn"
                  aria-hidden="true"
                  onClick={() =>
                    navigate(`/${organization.name}/${schema.name}`)
                  }>
                  <Avatar name={schema.label} size="75" round="12px" />
                  <p className="mt-2">{schema.label}</p>
                </div>
              ))}
            <div
              className="col-md-2 col-sm-6 text-center btn"
              aria-hidden="true"
              onClick={() => {
                actions.setFormData({});
                actions.setType('createDatabase');
                actions.setShow(true);
              }}>
              <Avatar name="+" size="75" round="12px" color="#4B5563" />
              <p className="mt-2">Add database</p>
            </div>
          </div>
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
