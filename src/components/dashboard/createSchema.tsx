import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { Button } from 'evergreen-ui';
import { actions } from '../../state/actions';
import { OrganizationItemType, SchemaItemType } from '../../types';
import Delayed from '../common/delayed';

type CreateSchemaType = {
  cloudContext: any;
  actions: any;
  schemas: SchemaItemType[];
  organizations: OrganizationItemType[];
};

const CreateSchema = ({
  cloudContext,
  actions,
  schemas,
  organizations,
}: CreateSchemaType) => {
  const error = cloudContext?.userMessages?.WB_NO_SCHEMAS_FOUND[0]
    .replace(/([.?!])\s*(?=[A-Z])/g, '$1|')
    .split('|');

  return (
    schemas.length < 1 &&
    organizations.length < 1 && (
      <Delayed wait={2000}>
        <div
          className="d-flex align-items-center"
          style={{ marginTop: '30vh' }}>
          <div
            className="container text-center rounded p-4"
            style={{ backgroundColor: '#ececec', width: '60%' }}>
            <div>
              <p style={{ fontSize: '20px' }}>{error?.[0]}</p>
              <p className="text-muted">{error?.[1]}</p>
              <div
                className="text-center btn"
                aria-hidden="true"
                onClick={() => {
                  actions.setFormData({});
                  actions.setType('createDatabase');
                  actions.setShow(true);
                }}>
                <Button appearance="primary" size="large">
                  + Create new database
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Delayed>
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
