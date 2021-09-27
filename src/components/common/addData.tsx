import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Avatar from 'react-avatar';
import { actions } from '../../state/actions';
import { SchemaItemType } from '../../types';
import { checkPermission } from '../../utils/checkPermission';
import { isObjectEmpty } from '../../utils/objectEmpty';
import { getOrganizationValue } from '../../utils/select';

type AddDataType = {
  actions: any;
  type: string;
  permissionType?: string | null;
  name: string;
  schema: SchemaItemType;
  extraParams?: any;
};

const defaultProps = {
  permissionType: null,
  extraParams: null,
};

const AddData = ({
  actions,
  type,
  name,
  schema,
  permissionType,
  extraParams,
}: AddDataType) => {
  const organization = extraParams?.organization;
  const hasPermission = checkPermission(
    permissionType,
    name === 'table'
      ? !isObjectEmpty(schema) && schema.role.name
      : typeof organization !== 'undefined' && organization.role.name,
  );

  return (
    <>
      {hasPermission && (
        <div
          className="col-md-2 col-sm-6 text-center btn"
          aria-hidden="true"
          onClick={() => {
            actions.setFormData(
              type === 'createDatabase'
                ? {
                    organization: getOrganizationValue(organization.name),
                  }
                : { schema },
            );
            actions.setType(type);
            actions.setShow(true);
          }}>
          <Avatar name="+" size="75" round="12px" color="#4B5563" />
          <p className="mt-2">Add {name}</p>
        </div>
      )}
    </>
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
