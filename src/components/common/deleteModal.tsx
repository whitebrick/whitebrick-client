import React, { useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { TextInputField, Dialog } from 'evergreen-ui';
import { useMutation } from 'graphql-hooks';
import { SchemaItemType } from '../../types';
import { actions } from '../../state/actions';
import { REMOVE_OR_DELETE_SCHEMA_MUTATION } from '../../graphql/mutations/wb';

type DeleteModalType = {
  schema: SchemaItemType;
  actions: any;
  show: boolean;
  setShow: any;
};

const DeleteModal = ({ schema, actions, show, setShow }: DeleteModalType) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  const [removeOrDeleteSchemaMutation] = useMutation(
    REMOVE_OR_DELETE_SCHEMA_MUTATION,
  );

  const onSave = async () => {
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
  };

  const onCancel = () => {
    setShow(false);
  };

  return (
    <Dialog
      isShown={show}
      title={`Delete Database ${schema.name}`}
      intent="danger"
      onConfirm={onSave}
      onCancel={onCancel}>
      <TextInputField
        label="Confirm action"
        description={`Enter ${schema.name} to confirm delete`}
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      {error && (
        <div className="alert alert-danger" role="alert">
          Oops, you must have mispelled database name.
        </div>
      )}
    </Dialog>
  );
};

const mapStateToProps = state => ({
  schema: state.schema,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(DeleteModal);
