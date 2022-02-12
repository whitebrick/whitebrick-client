import React from 'react';
import { Button } from 'evergreen-ui';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actions } from '../../../state/actions';
import { OrganizationItemType, SchemaItemType } from '../../../types';
import { checkPermission } from '../../../utils/checkPermission';
import { isObjectEmpty } from '../../../utils/objectEmpty';
import { getOrganizationValue, getSchemaValue } from '../../../utils/select';

type NoItemProps = {
  data: OrganizationItemType | SchemaItemType;
  actions: any;
  type: any;
};

const NoItem = ({ data, actions, type }: NoItemProps) => {
  const hasSchemaPermission = checkPermission(
    'administer_organization',
    !isObjectEmpty(data) && data?.role?.name,
  );

  const hasTablePermission = checkPermission(
    'alter_schema',
    !isObjectEmpty(data) && data?.role?.name,
  );

  const hasPermission =
    type === 'schema' ? hasSchemaPermission : hasTablePermission;
  const actionType = type === 'schema' ? 'createDatabase' : 'createTable';
  const formData =
    type === 'schema'
      ? { organization: getOrganizationValue(data?.name) }
      : { schema: getSchemaValue(data?.name) };

  return (
    <>
      <p>
        You don&apos;t have any {type === 'schema' ? 'databases' : 'tables'} in
        here!
      </p>
      {hasPermission && (
        <Button
          appearance="primary"
          onClick={() => {
            actions.setFormData(formData);
            actions.setType(actionType);
            actions.setShow(true);
          }}>
          + Create {type === 'schema' ? 'database' : type}
        </Button>
      )}
    </>
  );
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(null, mapDispatchToProps)(NoItem);
