import React, { useState } from 'react';
import { PlusIcon, CogIcon, NewPersonIcon, TrashIcon } from 'evergreen-ui';
import { useMutation } from 'graphql-hooks';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actions } from '../../state/actions';
import { SchemaItemType, TableItemType } from '@/types';
import DeleteModal from '../common/deleteModal';
import { REMOVE_OR_DELETE_TABLE_MUTATION } from '../../graphql/mutations/wb';

type DatabaseProps = {
  setFormData: (value: any) => void;
  setType: (value: string) => void;
  setShow: (value: boolean) => void;
  schema: SchemaItemType;
  table: TableItemType;
  actions;
};

const DatabaseSettings = ({
  setType,
  setShow,
  setFormData,
  schema,
  table,
  actions,
}: DatabaseProps) => {
  const userRole = schema?.role?.name;
  const [showDelete, setShowDelete] = useState(false);
  const [removeOrDeleteTableMutation] = useMutation(
    REMOVE_OR_DELETE_TABLE_MUTATION,
  );

  const deleteSchema = () => {
    setShowDelete(true);
  };

  const deleteTable = async () => {
    await removeOrDeleteTableMutation({
      variables: {
        schemaName: schema.name,
        tableName: table.name,
        del: true,
      },
    });
    actions.setTable('');
    window.location.replace('/');
  };

  return (
    <>
      <div className="sidebar-heading mt-2 list-group-item">
        Database Settings
      </div>
      <div
        onClick={() => {
          setShow(true);
          setType('createTable');
          setFormData({ schema });
        }}
        aria-hidden="true"
        className="list-group-item py-1 d-flex align-items-center">
        <PlusIcon /> <span className="ml-2">New table</span>
      </div>
      <div className="list-group-item py-1 d-flex align-items-center">
        <CogIcon /> <span className="ml-2">Settings</span>
      </div>
      <div className="list-group-item py-1 d-flex align-items-center">
        <NewPersonIcon /> <span className="ml-2">Invite others</span>
      </div>
      {(userRole === 'schema_owner' || userRole === 'schema_administrator') && (
        <div
          className="list-group-item py-1 d-flex align-items-center text-danger"
          aria-hidden="true"
          onClick={deleteSchema}>
          <TrashIcon />
          <div className="ml-2">Delete {schema.label}</div>
        </div>
      )}
      {showDelete && (
        <DeleteModal
          show={showDelete}
          setShow={setShowDelete}
          type="database"
        />
      )}
      {table.name && (
        <div
          className="list-group-item py-1 d-flex align-items-center"
          aria-hidden="true"
          onClick={deleteTable}>
          <TrashIcon />{' '}
          <div className="ml-2">Delete {table.label.toLowerCase()}</div>
        </div>
      )}
    </>
  );
};

const mapStateToProps = state => ({
  schema: state.schema,
  table: state.table,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(DatabaseSettings);
