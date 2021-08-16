import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Avatar from 'react-avatar';
import { actions } from '../../state/actions';
import { SchemaItemType } from '../../types';

type AddDataType = {
  actions: any;
  type: string;
  name: string;
  schema: SchemaItemType;
  extraParams?: any;
};

const defaultProps = {
  extraParams: null,
};

const AddData = ({
  actions,
  type,
  name,
  schema,
  extraParams = null,
}: AddDataType) => {
  const organization = extraParams?.organization;
  return (
    <div
      className="col-md-2 col-sm-6 text-center btn"
      aria-hidden="true"
      onClick={() => {
        actions.setFormData(
          type === 'createDatabase' ? { organization } : { schema },
        );
        actions.setType(type);
        actions.setShow(true);
      }}>
      <Avatar name="+" size="75" round="12px" color="#4B5563" />
      <p className="mt-2">Add {name}</p>
    </div>
  );
};

AddData.defaultProps = defaultProps;
const mapStateToProps = state => ({
  schema: state.schema,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(AddData);
