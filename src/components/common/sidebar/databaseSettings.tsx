import React, { useState } from 'react';
import { PlusIcon, CogIcon, NewPersonIcon, TrashIcon } from 'evergreen-ui';
import { useManualQuery } from 'graphql-hooks';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actions } from '../../../state/actions';
import { SchemaItemType } from '../../../types';
import DeleteModal from '../deleteModal';
import InviteUserModal from '../inviteUserModal';
import { SCHEMA_USERS_QUERY } from '../../../graphql/queries/wb';

type DatabaseProps = {
  expand: boolean;
  schema: SchemaItemType;
  actions: any;
};

const DatabaseSettings = ({ expand, schema, actions }: DatabaseProps) => {
  const userRole = schema?.role?.name;
  const [showDelete, setShowDelete] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  const [fetchSchemaUsers] = useManualQuery(SCHEMA_USERS_QUERY, {
    variables: {
      schemaName: schema?.name,
    },
  });

  const fetchData = () => {
    fetchSchemaUsers().then(r => actions.setUsers(r?.data?.wbSchemaUsers));
  };

  return (
    Object.keys(schema).length > 0 &&
    expand && (
      <>
        <div className="sidebar-heading mt-2 list-group-item">
          Database Settings
        </div>
        <div
          onClick={() => {
            actions.setShow(true);
            actions.setType('createTable');
            actions.setFormData({ schema });
          }}
          aria-hidden="true"
          className="list-group-item py-1 d-flex align-items-center">
          <PlusIcon /> <span className="ml-2">New table</span>
        </div>
        <div className="list-group-item py-1 d-flex align-items-center">
          <CogIcon /> <span className="ml-2">Settings</span>
        </div>
        <div
          aria-hidden
          onClick={() => setShowInvite(true)}
          className="list-group-item py-1 d-flex align-items-center">
          <NewPersonIcon /> <span className="ml-2">Invite others</span>
        </div>
        {(userRole === 'schema_owner' ||
          userRole === 'schema_administrator') && (
          <div
            className="list-group-item py-1 d-flex align-items-center text-danger"
            aria-hidden="true"
            onClick={() => setShowDelete(true)}>
            <TrashIcon />
            <div className="ml-2">Delete {schema.label}</div>
          </div>
        )}
        {showDelete && (
          <DeleteModal
            show={showDelete}
            setShow={setShowDelete}
            type="schema"
          />
        )}
        <InviteUserModal
          show={showInvite}
          setShow={setShowInvite}
          name="schema"
        />
      </>
    )
  );
};

const mapStateToProps = state => ({
  schema: state.schema,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(DatabaseSettings);
