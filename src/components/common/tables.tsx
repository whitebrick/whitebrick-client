import React from 'react';
import { bindActionCreators } from 'redux';
import { actions } from '../../actions';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import Avatar from 'react-avatar';
import { navigate } from 'gatsby';
import Skeleton from 'react-loading-skeleton';

type TablesPropsType = {
  schema: any;
  tables: any[];
  loaded: boolean;
};

const Tables = ({ schema, tables, loaded }: TablesPropsType) => {
  return (
    <div className="card my-4">
      <div className="card-header">
        <h4>{schema.label}</h4>
      </div>
      <div className="card-body">
        <div className="row">
          {loaded ?? tables.length > 0
            ? tables.map(table => (
                <div
                  className="col-md-2 text-center btn"
                  aria-hidden="true"
                  onClick={() =>
                    navigate(`/database/${schema.name}/table/${table.name}`)
                  }>
                  <Avatar name={table.label} size="75" round="12px" />
                  <p className="mt-2">{table.label}</p>
                </div>
              ))
            : [...Array(12)].map((e, i) => (
                <div className="col-md-2 text-center btn" key={i}>
                  <Skeleton height="100px" />
                </div>
              ))}
          {loaded && (
            <div className="col-md-2 text-center btn">
              <Avatar name="+" size="75" round="12px" />
              <p className="mt-2">Add table</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  schema: state.schema,
  tables: state.tables,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuthenticationRequired(Tables));
