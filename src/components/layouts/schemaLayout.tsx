import React from 'react';
import { EditIcon, IconButton } from 'evergreen-ui';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import SchemaTablesList from '../dashboard/schemaTablesList';
import Tabs from '../elements/tabs';
import { SchemaItemType } from '../../types';
import { actions } from '../../state/actions';
import Members from '../common/members';
import Breadcrumb from '../common/breadcrumb';
import { checkPermission } from '../../utils/checkPermission';

type SchemaLayoutType = {
  schema: SchemaItemType;
  actions: any;
};

const SchemaLayout = ({ schema, actions }: SchemaLayoutType) => {
  const userRole = schema?.role?.name;
  const canEdit = checkPermission('alter_schema', userRole);

  const tabs = [
    {
      title: 'Tables',
      element: <SchemaTablesList />,
    },
    {
      title: 'Members',
      element: <Members name="schema" />,
      noPane: true,
    },
  ];

  return (
    <div className="mt-3">
      <div style={{ padding: `1rem` }}>
        <Breadcrumb />
        <h3 className="m-0 w-50">
          <span>
            {schema.label}
            {canEdit && (
              <IconButton
                appearance="minimal"
                className="ml-1"
                onClick={() => {
                  actions.setType('editDatabase');
                  actions.setFormData(schema);
                  actions.setShow(true);
                }}
                icon={EditIcon}
              />
            )}
          </span>
        </h3>
        <div className="mt-4">
          <Tabs items={tabs} />
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  schema: state.schema,
  users: state.users,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(SchemaLayout);
