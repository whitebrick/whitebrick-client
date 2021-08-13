import React from 'react';
import { AddIcon } from 'evergreen-ui';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actions } from '../../state/actions';
import { SchemaItemType } from '../../types';

type NoDataType = {
  actions: any;
  type: string;
  name: string;
  schema: SchemaItemType;
};

const NoData = ({ actions, type, name, schema }: NoDataType) => {
  return (
    <div className="col-md-6 offset-md-4">
      <div
        className="text-center rounded p-2"
        style={{ backgroundColor: '#ececec', width: '60%' }}>
        <p>You do not have any {name} yet.</p>
        <div
          aria-hidden
          onClick={() => {
            actions.setFormData(type === 'createDatabase' ? {} : { schema });
            actions.setType(type);
            actions.setShow(true);
          }}>
          <AddIcon color="info" />
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  schema: state.schema,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(NoData);
