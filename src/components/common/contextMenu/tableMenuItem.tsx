import React, { useState } from 'react';
import { Item, Menu, Separator, useContextMenu } from 'react-contexify';
import { navigate } from 'gatsby';
import Avatar from 'react-avatar';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { EditIcon, NewPersonIcon, TrashIcon } from 'evergreen-ui';
import { SchemaItemType, TableItemType } from '../../../types';
import { actions } from '../../../state/actions';
import { checkPermission } from '../../../utils/checkPermission';
import InviteUserModal from '../inviteUserModal';
import DeleteModal from '../deleteModal';
import { getSchemaValue } from '../../../utils/select';

type TableMenuItemProps = {
  tableItem: TableItemType;
  schema: SchemaItemType;
  actions: any;
};

const TableMenuItem = ({ tableItem, schema, actions }: TableMenuItemProps) => {
  const MENU_ID = tableItem.name;
  const { show } = useContextMenu({ id: MENU_ID });

  const [showInvite, setShowInvite] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const hasPermission = checkPermission('alter_table', tableItem?.role?.name);
  const hasInvitePermission = checkPermission(
    'manage_access_to_table',
    tableItem?.role?.name,
  );

  const handleEdit = () => {
    actions.setType('editTable');
    actions.setFormData({ ...tableItem, schema: getSchemaValue(schema.name) });
    actions.setShow(true);
  };

  return (
    <>
      <div
        key={MENU_ID}
        onContextMenu={e => show(e)}
        aria-hidden="true"
        onClick={() => {
          if (schema.organizationOwnerName)
            navigate(
              `/${schema.organizationOwnerName}/${schema.name}/${tableItem.name}`,
            );
          else navigate(`/db/${schema.name}/${tableItem.name}`);
        }}>
        <Avatar name={tableItem.label} size="75" round="12px" />
        <p className="mt-2">{tableItem.label}</p>
      </div>
      <div>
        <Menu id={MENU_ID}>
          <Item onClick={handleEdit} disabled={!hasPermission}>
            <EditIcon marginRight={10} /> Edit
          </Item>
          <Item
            onClick={() => setShowInvite(true)}
            disabled={!hasInvitePermission}>
            <NewPersonIcon marginRight={10} />
            Invite others
          </Item>
          <Separator />
          <Item onClick={() => setShowDelete(true)} disabled={!hasPermission}>
            <TrashIcon color="danger" marginRight={10} />
            <span className="text-danger">Delete</span>
          </Item>
        </Menu>
      </div>
      <InviteUserModal
        name="table"
        show={showInvite}
        setShow={setShowInvite}
        singleTable={tableItem}
      />
      <DeleteModal
        type="table"
        show={showDelete}
        setShow={setShowDelete}
        table={tableItem}
      />
    </>
  );
};

const mapStateToProps = state => ({
  schema: state.schema,
  organization: state.organization,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(TableMenuItem);
