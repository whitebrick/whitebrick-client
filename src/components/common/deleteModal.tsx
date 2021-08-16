import React, { useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { TextInputField, Dialog } from 'evergreen-ui';
import { useMutation } from 'graphql-hooks';
import { SchemaItemType } from '../../types';
import { actions } from '../../state/actions';
import {
  REMOVE_OR_DELETE_SCHEMA_MUTATION,
  DELETE_ORGANIZATION_MUTATION,
} from '../../graphql/mutations/wb';

type DeleteModalType = {
  schema: SchemaItemType;
  actions: any;
  show: boolean;
  setShow: any;
  type: string;
  org?: any;
};

const defaultProps = {
  org: null,
};

const DeleteModal = ({
  schema,
  actions,
  show,
  setShow,
  type,
  org = null,
}: DeleteModalType) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  const [removeOrDeleteSchemaMutation] = useMutation(
    REMOVE_OR_DELETE_SCHEMA_MUTATION,
  );

  const [deleteOrganizationMutation] = useMutation(
    DELETE_ORGANIZATION_MUTATION,
  );

  const onSave = async () => {
    if (type === 'organization') {
      if (value === org.name) {
        await deleteOrganizationMutation({
          variables: { name: org.name },
        });
        window.location.replace('/');
      } else {
        setError(true);
      }
    } else if (type === 'database') {
      if (value === schema.name) {
        await removeOrDeleteSchemaMutation({
          variables: {
            name: schema.name,
            del: true,
          },
        });
        actions.setSchema({});
        window.location.replace('/');
      } else {
        setError(true);
      }
    } else {
      // To be implemented (table section)
    }
  };

  const onCancel = () => {
    setShow(false);
  };

  const name = type === 'organization' ? org.name : schema.name;

  return (
    <Dialog
      isShown={show}
      title={`Delete ${type} ${name}`}
      intent="danger"
      onConfirm={onSave}
      confirmLabel="Delete"
      isConfirmDisabled={name !== value}
      onCancel={onCancel}>
      <TextInputField
        label="Confirm action"
        description={`Enter '${
          type === 'organization' ? org.name : schema.name
        }' to confirm delete`}
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      {error && (
        <div className="alert alert-danger" role="alert">
          Oops, you must have misspelled {type} name.
        </div>
      )}
    </Dialog>
  );
};

DeleteModal.defaultProps = defaultProps;
const mapStateToProps = state => ({
  schema: state.schema,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(DeleteModal);
