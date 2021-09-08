import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import Avatar from 'react-avatar';
import { navigate } from 'gatsby';
import { actions } from '../../state/actions';
import AddData from '../common/addData';

type MyDatabasesPropsType = {
  schemas: any[];
  user: any;
  name?: string;
};

const defaultProps = {
  name: 'My Databases',
};

const MyDatabases = ({
  schemas,
  user,
  name = 'My Databases',
}: MyDatabasesPropsType) => {
  const filteredSchemas: any[] = schemas.filter(schema =>
    name === 'My Databases'
      ? schema.userOwnerEmail === user.email
      : schema.userOwnerEmail !== user.email &&
        schema.organizationOwnerName === null,
  );
  return (
    filteredSchemas.length > 0 && (
      <div className="card my-4">
        <div className="card-header">
          <h6>{name}</h6>
        </div>
        <div className="card-body">
          <div className="row">
            {filteredSchemas.map(schema => (
              <div
                key={schema.name}
                className="col-md-2 text-center btn"
                aria-hidden="true"
                onClick={() => navigate(`/db/${schema.name}`)}>
                <Avatar name={schema.label} size="75" round="12px" />
                <p className="mt-2">{schema.label}</p>
              </div>
            ))}
            {name === 'My Databases' && (
              <AddData name="database" type="createDatabase" permissionType={undefined}/>
            )}
          </div>
        </div>
      </div>
    )
  );
};

MyDatabases.defaultProps = defaultProps;
const mapStateToProps = state => ({
  schemas: state.schemas,
  user: state.user,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuthenticationRequired(MyDatabases));
