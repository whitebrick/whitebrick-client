import React, { useState } from 'react';
import { Item, Menu, Separator, useContextMenu } from 'react-contexify';
import { navigate } from 'gatsby';
import Avatar from 'react-avatar';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { EditIcon, NewPersonIcon, TrashIcon } from 'evergreen-ui';
import { SchemaItemType } from '../../../types';
import { actions } from '../../../state/actions';
import { checkPermission } from '../../../utils/checkPermission';
import InviteUserModal from '../inviteUserModal';
import DeleteModal from '../deleteModal';
import { getOrganizationValue } from '../../../utils/select';

type TableMenuItemProps = {
  schemaItem: SchemaItemType;
  actions: any;
};

const SchemaMenuItem = ({ schemaItem, actions }: TableMenuItemProps) => {
  const MENU_ID = schemaItem.name;
  const { show } = useContextMenu({ id: MENU_ID });

  const [showInvite, setShowInvite] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const hasPermission = checkPermission('alter_schema', schemaItem?.role?.name);
  const hasInvitePermission = checkPermission(
    'manage_access_to_schema',
    schemaItem?.role?.name,
  );

  const handleEdit = () => {
    actions.setType('editDatabase');
    actions.setFormData(
      schemaItem.organizationOwnerName
        ? {
            ...schemaItem,
            organization: getOrganizationValue(
              schemaItem.organizationOwnerName,
            ),
          }
        : schemaItem,
    );
    actions.setShow(true);
  };

  return (
    <>
      <div
        key={MENU_ID}
        onContextMenu={e => show(e)}
        className="col-md-2 col-sm-6 text-center btn"
        aria-hidden="true"
        onClick={() =>
          navigate(
            `/${
              schemaItem.organizationOwnerName
                ? schemaItem.organizationOwnerName
                : 'db'
            }/${schemaItem.name}`,
          )
        }>
        <Avatar name={schemaItem.label} size="75" round="12px" />
        <p className="mt-2">{schemaItem.label}</p>
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
        name="schema"
        show={showInvite}
        setShow={setShowInvite}
        singleSchema={schemaItem}
      />
      <DeleteModal
        show={showDelete}
        setShow={setShowDelete}
        type="schema"
        singleSchema={schemaItem}
      />
    </>
  );
};

const mapStateToProps = state => ({
  organizations: state.organizations,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(SchemaMenuItem);
