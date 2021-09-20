import React, { useState } from 'react';
import Avatar from 'react-avatar';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { navigate } from 'gatsby';
import { TrashIcon, EditIcon, NewPersonIcon } from 'evergreen-ui';
import { Menu, Item, useContextMenu } from 'react-contexify';
import { useManualQuery } from 'graphql-hooks';
import { SchemaItemType } from '../../types';
import { actions } from '../../state/actions';
import 'react-contexify/dist/ReactContexify.css';
import DeleteModal from './deleteModal';
import { checkPermission } from '../../utils/checkPermission';
import InviteUserModal from './inviteUserModal';
import {
  SCHEMA_USERS_QUERY,
  TABLE_USERS_QUERY,
} from '../../graphql/queries/wb';
import { isObjectEmpty } from '../../utils/objectEmpty';

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
  const [showInvite, setShowInvite] = useState(false);
  const hasTablePermission = checkPermission(
    'alter_schema',
    schema?.role?.name,
  );
  const hasSchemaPermission = checkPermission(
    'administer_organization',
    organization?.role?.name,
  );

  const hasSchemaInvitePermission = checkPermission(
    'manage_access_to_organization',
    organization?.role?.name,
  );

  const hasTableInvitePermission = checkPermission(
    'manage_access_to_schema',
    schema?.role?.name,
  );

  const [fetchSchemaUsers] = useManualQuery(SCHEMA_USERS_QUERY, {
    variables: {
      schemaName: isObjectEmpty(schema) ? singleSchema?.name : schema?.name,
    },
  });

  const [fetchSchemaTableUsers] = useManualQuery(TABLE_USERS_QUERY, {
    variables: {
      schemaName: isObjectEmpty(schema) ? singleSchema?.name : schema?.name,
      tableName: table?.name,
    },
  });

  const inviteName =
    // eslint-disable-next-line no-nested-ternary
    type === 'database' || type === 'myDatabase'
      ? 'schema'
      : type === 'table'
      ? 'table'
      : 'organization';
  const name = type === 'table' ? table.name : singleSchema.name;
  const label = type === 'table' ? table.label : singleSchema.label;
  const hasPermission =
    // eslint-disable-next-line no-nested-ternary
    type === 'table'
      ? hasTablePermission
      : type === 'database'
      ? hasSchemaPermission
      : true;
  const hasInvitePermission =
    // eslint-disable-next-line no-nested-ternary
    type === 'table'
      ? hasTableInvitePermission
      : type === 'database'
      ? hasSchemaInvitePermission
      : true;

  const MENU_ID = name;
  const { show } = useContextMenu({ id: MENU_ID });

  const handleEdit = () => {
    if (type === 'table') {
      actions.setType('editTable');
      actions.setFormData(table);
      actions.setShow(true);
    }

    if (type === 'database' || type === 'myDatabase') {
      actions.setType('editDatabase');
      actions.setFormData(singleSchema);
      actions.setShow(true);
    }
  };

  const fetchUsers = () => {
    if (inviteName === 'schema') {
      fetchSchemaUsers().then(r => actions.setUsers(r?.data?.wbSchemaUsers));
    } else {
      fetchSchemaTableUsers().then(r =>
        actions.setUsers(r?.data?.wbTableUsers),
      );
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
          key={name}
          className="col-md-2 col-sm-6 text-center btn"
          aria-hidden="true"
          onClick={() =>
            navigate(
              `/${organization === null ? 'db' : organization.name}/${name}`,
            )
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
          <Item
            onClick={() => {
              setShowInvite(true);
            }}
            disabled={!hasInvitePermission}>
            <NewPersonIcon marginRight={10} />
            Invite others
          </Item>
          <Item onClick={() => setShowDelete(true)} disabled={!hasPermission}>
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
      <InviteUserModal
        show={showInvite}
        setShow={setShowInvite}
        name={inviteName}
        refetch={fetchUsers}
        singleSchema={singleSchema}
        singleTable={table}
      />
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
