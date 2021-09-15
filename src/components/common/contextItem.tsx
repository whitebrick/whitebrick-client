import React, { useState } from 'react';
import Avatar from 'react-avatar';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { navigate } from 'gatsby';
import { TrashIcon, EditIcon } from 'evergreen-ui';
import { Menu, Item, useContextMenu } from 'react-contexify';
import { SchemaItemType } from '../../types';
import { actions } from '../../state/actions';
import 'react-contexify/dist/ReactContexify.css';
import DeleteModal from './deleteModal';
import { checkPermission } from '../../utils/checkPermission';

type ContextItemProps = {
  table?: any;
  singleSchema?: any;
  actions: any;
  schema: SchemaItemType;
  organization?: any;
  type: string;
};

const defaultProps = {
  table: null,
  singleSchema: null,
  organization: null,
};

const ContextItem = ({
  table,
  actions,
  schema,
  singleSchema,
  organization,
  type,
}: ContextItemProps) => {
  const [showDelete, setShowDelete] = useState(false);
  const hasTablePermission = checkPermission(
    'alter_schema',
    schema?.role?.name,
  );
  const hasSchemaPermission = checkPermission(
    'administer_organization',
    organization?.role?.name,
  );

  const name = type === 'table' ? table.name : singleSchema.name;
  const label = type === 'table' ? table.label : singleSchema.label;
  const hasPermission =
    type === 'table' ? hasTablePermission : hasSchemaPermission;

  const MENU_ID = name;
  const { show } = useContextMenu({ id: MENU_ID });

  const handleEdit = () => {
    if (type === 'table') {
      actions.setType('editTable');
      actions.setFormData(table);
      actions.setShow(true);
    }

    if (type === 'database') {
      actions.setType('editDatabase');
      actions.setFormData(singleSchema);
      actions.setShow(true);
    }
  };

  return (
    <>
      {type === 'table' ? (
        <div
          onContextMenu={e => show(e)}
          aria-hidden="true"
          onClick={() => {
            if (schema.organizationOwnerName)
              navigate(
                `/${schema.organizationOwnerName}/${schema.name}/${name}`,
              );
            else navigate(`/db/${schema.name}/table/${name}`);
          }}>
          <Avatar name={label} size="75" round="12px" />
          <p className="mt-2">{label}</p>
        </div>
      ) : (
        <div
          onContextMenu={e => show(e)}
          key={singleSchema.name}
          className="col-md-2 col-sm-6 text-center btn"
          aria-hidden="true"
          onClick={() =>
            navigate(`/${organization.name}/${singleSchema.name}`)
          }>
          <Avatar name={label} size="75" round="12px" />
          <p className="mt-2">{label}</p>
        </div>
      )}
      <div>
        <Menu id={MENU_ID}>
          <Item onClick={handleEdit} disabled={!hasPermission}>
            <EditIcon marginRight={10} /> Edit {label}
          </Item>
          <Item onClick={() => setShowDelete(true)} disabled={!hasPermission}>
            {' '}
            <TrashIcon color="danger" marginRight={10} />
            <span className="text-danger">Delete {label}</span>
          </Item>
        </Menu>
      </div>
      {showDelete && (
        <DeleteModal
          show={showDelete}
          setShow={setShowDelete}
          type={type}
          table={table}
          singleSchema={singleSchema}
        />
      )}
    </>
  );
};

ContextItem.defaultProps = defaultProps;
const mapStateToProps = state => ({
  schema: state.schema,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ContextItem);
