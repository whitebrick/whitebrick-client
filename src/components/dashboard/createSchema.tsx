import React from 'react';
import Avatar from 'react-avatar';
import { bindActionCreators } from 'redux';
import { actions } from '../../state/actions';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { OrganizationItemType, SchemaItemType } from '../../types';

type CreateSchemaType = {
  cloudContext: any;
  setType: (value: string) => void;
  setShow: (value: boolean) => void;
  actions: any;
  schemas: SchemaItemType[];
  organizations: OrganizationItemType[];
};

const CreateSchema = ({
  cloudContext,
  setType,
  setShow,
  actions,
  schemas,
  organizations,
}: CreateSchemaType) => {
  return (
    schemas.length < 1 &&
    organizations.length < 1 && (
      <div className="d-flex align-items-center" style={{ marginTop: '30vh' }}>
        <div className="container text-center">
          <div>
            <p>{cloudContext?.userMessages?.WB_NO_SCHEMAS_FOUND}</p>
            <div
              className="text-center btn"
              aria-hidden="true"
              onClick={() => {
                actions.setFormData({});
                setType('database');
                setShow(true);
              }}>
              <Avatar name="+" size="75" round="12px" color="gray" />
            </div>
          </div>
        </div>
      </div>
    )
  );
};

const mapStateToProps = state => ({
  cloudContext: state.cloudContext,
  schemas: state.schemas,
  organizations: state.organizations,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuthenticationRequired(CreateSchema));
