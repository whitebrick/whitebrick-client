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
  REMOVE_OR_DELETE_TABLE_MUTATION,
} from '../../graphql/mutations/wb';

type DeleteModalType = {
  singleSchema?: any;
  schema: SchemaItemType;
  table?: any;
  actions: any;
  show: boolean;
  setShow: any;
  type: string;
  org?: any;
};

const defaultProps = {
  org: null,
  table: null,
  singleSchema: null,
};

const DeleteModal = ({
  schema,
  singleSchema,
  actions,
  show,
  setShow,
  type,
  org,
  table,
}: DeleteModalType) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  const [removeOrDeleteSchemaMutation] = useMutation(
    REMOVE_OR_DELETE_SCHEMA_MUTATION,
  );

  const [deleteOrganizationMutation] = useMutation(
    DELETE_ORGANIZATION_MUTATION,
  );

  const [removeOrDeleteTableMutation] = useMutation(
    REMOVE_OR_DELETE_TABLE_MUTATION,
  );

  const name =
    // eslint-disable-next-line no-nested-ternary
    type === 'organization'
      ? org.name
      : // eslint-disable-next-line no-nested-ternary
      type === 'schema' && schema.name !== undefined
      ? schema.name
      : type === 'schema' && schema.name === undefined
      ? singleSchema.name
      : table.name;

  const onSave = async () => {
    if (type === 'organization') {
      if (value === name) {
        await deleteOrganizationMutation({
          variables: { name },
        });
        window.location.replace('/');
      } else {
        setError(true);
      }
    } else if (type === 'database' || type === 'myDatabase') {
      if (value === name) {
        await removeOrDeleteSchemaMutation({
          variables: {
            name,
            del: true,
          },
        });
        actions.setSchema({});
        window.location.replace('/');
      } else {
        setError(true);
      }
    } else if (value === name) {
      await removeOrDeleteTableMutation({
        variables: {
          schemaName: schema.name,
          tableName: name,
          del: true,
        },
      });
      actions.setTable('');
      window.location.replace('/');
    } else {
      setError(true);
    }
  };

  return (
    <Dialog
      isShown={show}
      title={`Delete ${type === 'myDatabase' ? 'database' : type} ${name}`}
      intent="danger"
      onConfirm={onSave}
      confirmLabel="Delete"
      isConfirmDisabled={name !== value}
      onCancel={() => setShow(false)}>
      <TextInputField
        label="Confirm action"
        description={`Enter '${name}' to confirm delete`}
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
