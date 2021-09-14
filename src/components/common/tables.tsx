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

type TablesProps = {
  table: any;
  actions: any;
  schema: SchemaItemType;
};

const Tables = ({ table, actions, schema }: TablesProps) => {
  const [showDelete, setShowDelete] = useState(false);
  const hasPermission = checkPermission('alter_schema', schema?.role?.name);
  console.log(table);

  const MENU_ID = table.name;
  const { show } = useContextMenu({
    id: MENU_ID,
  });

  const displayMenu = e => {
    show(e);
  };

  const handleEdit = () => {
    console.log(schema);
    actions.setType('editTable');
    actions.setFormData(table);
    actions.setShow(true);
  };

  return (
    <>
      <div
        onContextMenu={displayMenu}
        aria-hidden="true"
        onClick={() => {
          if (schema.organizationOwnerName)
            navigate(
              `/${schema.organizationOwnerName}/${schema.name}/${table.name}`,
            );
          else navigate(`/db/${schema.name}/table/${table.name}`);
        }}>
        <Avatar name={table.label} size="75" round="12px" />
        <p className="mt-2">{table.label}</p>
      </div>
      <div>
        <Menu id={MENU_ID}>
          <Item onClick={() => setShowDelete(true)} disabled={!hasPermission}>
            {' '}
            <TrashIcon color="danger" marginRight={10} />
            <span className="text-danger">Delete {table.label}</span>
          </Item>
          <Item onClick={handleEdit} disabled={!hasPermission}>
            <EditIcon marginRight={10} /> Edit {table.label}
          </Item>
        </Menu>
      </div>
      {showDelete && (
        <DeleteModal
          show={showDelete}
          setShow={setShowDelete}
          type="table"
          table={table}
        />
      )}
    </>
  );
};

const mapStateToProps = state => ({
  schema: state.schema,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Tables);
