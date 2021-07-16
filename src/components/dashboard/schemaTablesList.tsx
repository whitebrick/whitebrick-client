import React from 'react';
import { bindActionCreators } from 'redux';
import { actions } from '../../state/actions';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import Avatar from 'react-avatar';
import { navigate } from 'gatsby';
import Skeleton from 'react-loading-skeleton';
import { SchemaItemType, TableItemType } from '../../types';
import { Pane } from 'evergreen-ui';

type TablesPropsType = {
  schema: SchemaItemType;
  tables: Array<TableItemType>;
  loaded: boolean;
};

const SchemaTablesList = ({ schema, tables, loaded }: TablesPropsType) => {
  return (
    <Pane padding={16} flex={1} background="tint1">
      <div className="row">
        {loaded ?? tables.length > 0
          ? tables.map(table => (
              <div
                className="col-md-2 text-center btn"
                aria-hidden="true"
                onClick={() =>
                  navigate(`/db/${schema.name}/table/${table.name}`)
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
    </Pane>
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
)(withAuthenticationRequired(SchemaTablesList));
