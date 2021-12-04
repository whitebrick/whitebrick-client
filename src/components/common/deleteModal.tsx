import React, { useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { TextInputField, Dialog } from 'evergreen-ui';
import { useMutation, useManualQuery } from 'graphql-hooks';
import { navigate } from 'gatsby';
import { SchemaItemType } from '../../types';
import { actions } from '../../state/actions';
import {
  REMOVE_OR_DELETE_SCHEMA_MUTATION,
  DELETE_ORGANIZATION_MUTATION,
  REMOVE_OR_DELETE_TABLE_MUTATION,
} from '../../graphql/mutations/wb';
import { SCHEMAS_QUERY, SCHEMA_TABLES_QUERY } from '../../graphql/queries/wb';

type DeleteModalType = {
  singleSchema?: any;
  schema: SchemaItemType;
  table?: any;
  actions: any;
  show: boolean;
  setShow: any;
  type: string;
  org?: any;
  navigateBack?: boolean;
};

const defaultProps = {
  org: null,
  table: null,
  singleSchema: null,
  navigateBack: false,
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
  navigateBack,
}: DeleteModalType) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [removeOrDeleteSchemaMutation] = useMutation(
    REMOVE_OR_DELETE_SCHEMA_MUTATION,
  );

  const [deleteOrganizationMutation] = useMutation(
    DELETE_ORGANIZATION_MUTATION,
  );

  const [removeOrDeleteTableMutation] = useMutation(
    REMOVE_OR_DELETE_TABLE_MUTATION,
  );

  const [fetchSchemas] = useManualQuery(SCHEMAS_QUERY);
  const [fetchSchemaTables] = useManualQuery(SCHEMA_TABLES_QUERY);

  const refetchSchemas = async () => {
    const { loading, data, error } = await fetchSchemas();
    if (!error && !loading) actions.setSchemas(data.wbMySchemas);
  };

  const refetchTables = async () => {
    const { loading, data, error } = await fetchSchemaTables({
      variables: {
        schemaName: schema.name,
      },
    });
    if (!error && !loading) actions.setTables(data.wbMyTables);
  };

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
    setIsLoading(true);
    if (type === 'organization') {
      if (value === name) {
        await deleteOrganizationMutation({
          variables: { name },
        }).then(() => setIsLoading(false));
        window.location.replace('/');
      } else {
        setError(true);
      }
    } else if (type === 'schema') {
      if (value === name) {
        setIsLoading(true);
        await removeOrDeleteSchemaMutation({
          variables: {
            name,
            del: true,
          },
        }).then(() => setIsLoading(false));
        actions.setSchema({});
        refetchSchemas().finally(() => setShow(false));
      } else {
        setError(true);
      }
    } else if (value === name) {
      setIsLoading(true);
      await removeOrDeleteTableMutation({
        variables: {
          schemaName: schema.name,
          tableName: name,
          del: true,
        },
      }).then(() => setIsLoading(false));
      if (navigateBack) {
        navigate(
          schema.organizationOwnerName
            ? `/${schema.organizationOwnerName}/${schema.name}/`
            : `/db/${schema.name}/`,
        );
      } else {
        actions.setTable('');
        refetchTables().finally(() => setShow(false));
      }
    } else {
      setError(true);
    }
  };

  return (
    <Dialog
      isShown={show}
      title={`Delete ${type === 'schema' ? 'database' : type} ${name}`}
      intent="danger"
      onConfirm={onSave}
      confirmLabel="Delete"
      isConfirmLoading={isLoading}
      isConfirmDisabled={name !== value}
      onCancel={() => setShow(false)}
      shouldCloseOnOverlayClick={false}>
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
