import React, { useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import * as Yup from 'yup';
import { useManualQuery, useMutation } from 'graphql-hooks';
import { GridApi } from 'ag-grid-community';
import { toaster } from 'evergreen-ui';
import { actions } from '../../../state/actions';
import { ColumnItemType, SchemaItemType, TableItemType } from '../../../types';
import FormMaker from '../../elements/formMaker';
import { placeholders } from './placeholders';
import {
  ADD_OR_CREATE_COLUMN_MUTATION,
  ADD_OR_REMOVE_COLUMN_SEQUENCE,
  CREATE_OR_ADD_FOREIGN_KEY,
  CREATE_OR_DELETE_PRIMARY_KEYS,
  UPDATE_COLUMN_MUTATION,
  RETRACK_TABLE,
} from '../../../graphql/mutations/wb';
import { COLUMNS_BY_NAME_QUERY } from '../../../graphql/queries/wb';

type ColumnFormPropsType = {
  table: TableItemType;
  tables: TableItemType[];
  schema: SchemaItemType;
  type: 'addColumn' | 'editColumn';
  column: any;
  columns: ColumnItemType[];
  cloudContext: any;
  formData: any;
  gridAPI: GridApi;
  actions: any;
  columnFields: any;
};

const parseColumnTypes = (types: any) => {
  const opts = [];
  Object.entries(types).map((arr: any) =>
    opts.push({ key: arr[0], value: arr[1].pgType }),
  );
  return opts;
};

const columnForm = (
  type: 'addColumn' | 'editColumn',
  tables: TableItemType[],
  cloudContext: any,
  formData: any = null,
) => {
  return {
    fields: [
      {
        name: 'name',
        label: 'Column Name',
        type: 'text',
        placeholder: `${placeholders.columnName}`,
        required: true,
      },
      {
        name: 'label',
        label: 'Column Label',
        type: 'text',
        placeholder: `${placeholders.columnLabel}`,
        required: true,
      },
      {
        name: 'type',
        label: 'Column Type',
        type: 'select',
        options: parseColumnTypes(cloudContext?.defaultColumnTypes),
        required: true,
      },
      {
        name: 'isPrimaryKey',
        label: 'Primary key?',
        type: 'checkbox',
      },
      {
        name: 'isNotNullable',
        label: 'Required?',
        type: 'checkbox',
      },
      {
        name: 'autoIncrement',
        label: 'Auto Increment?',
        type: 'checkbox',
        render: { variable: 'type', equalsTo: 'integer', type: 'comparison' },
      },
      {
        name: 'startSequenceNumber',
        label: 'Start sequence at (optional)',
        type: 'text',
        render: {
          variable: 'autoIncrement',
          equalsTo: true,
          type: 'comparison',
        },
      },
      {
        name: 'foreignKey',
        label: 'Add a foreign key relation',
        type: 'foreignKeyButton',
      },
    ],
    initialValues: type === 'editColumn' ? formData : {},
    validationSchema: Yup.object(),
  };
};

const getValues = (type, formData, table, tables, cloudContext) => {
  if (type === 'addColumn')
    return {
      name: `Add new column to ${table.label}`,
      ...columnForm(type, tables, cloudContext, formData),
    };
  return {
    name: `Edit column in ${table.label}`,
    ...columnForm(type, tables, cloudContext, formData),
  };
};

const ColumnForm = ({
  table,
  tables,
  schema,
  type,
  formData,
  cloudContext,
  column,
  columns,
  gridAPI,
  actions,
  columnFields,
}: ColumnFormPropsType) => {
  const [isLoading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  const [fetchTableColumns] = useManualQuery(COLUMNS_BY_NAME_QUERY);
  const [addOrCreateColumn] = useMutation(ADD_OR_CREATE_COLUMN_MUTATION);
  const [createOrDeletePrimaryKeys] = useMutation(
    CREATE_OR_DELETE_PRIMARY_KEYS,
  );
  const [updateColumn] = useMutation(UPDATE_COLUMN_MUTATION);
  const [addOrRemoveColumnSequence] = useMutation(
    ADD_OR_REMOVE_COLUMN_SEQUENCE,
  );
  const [createOrAddForeignKey] = useMutation(CREATE_OR_ADD_FOREIGN_KEY);
  const [retrackTable] = useMutation(RETRACK_TABLE);

  const value = getValues(type, formData, table, tables, cloudContext);

  const refetchColumns = async () => {
    const {
      loading: fl,
      data: fd,
      error: fe,
    } = await fetchTableColumns({
      variables: {
        schemaName: schema.name,
        tableName: table.name,
      },
    });
    if (!fl) {
      if (fe) setErrors(fe);
      else actions.setColumns(fd.wbColumns);
    }
  };

  const Retrack = async () => {
    const { loading, error } = await retrackTable({
      variables: {
        schemaName: schema.name,
        tableName: table.name,
      },
    });
    if (!loading && !error) {
      refetchColumns().finally(() => {
        setLoading(false);
        actions.setColumnFields(1);
        gridAPI.refreshCells({ force: true });
        actions.setShow(false);
        window.location.reload();
      });
    }
  };

  const updatePrimaryKey = async values => {
    const { loading, error } = await createOrDeletePrimaryKeys({
      variables: {
        schemaName: schema.name,
        tableName: table.name,
        columnNames: values.name,
        del: !values.isPrimaryKey,
      },
    });
    if (!loading) {
      if (error) {
        setErrors(error);
        setLoading(false);
        throw error;
      } else if (values.isPrimaryKey) {
        toaster.notify('Primary Key created...', { duration: 2 });
      } else {
        toaster.danger('Primary Key deleted...', { duration: 2 });
      }
    }
  };

  const updateForeignKey = async values => {
    const { loading, error } = await createOrAddForeignKey({
      variables: {
        schemaName: schema.name,
        tableName: table.name,
        columnNames: [values.name],
        parentTableName: values.table,
        parentColumnNames: [values.column],
        create: true,
      },
    });
    if (!loading) {
      if (error) {
        setErrors(error);
        setLoading(false);
        throw error;
      } else {
        toaster.notify('Foreign key created...', { duration: 2 });
      }
    }
  };

  const updateColumnInfo = async variables => {
    const { loading, error } = await updateColumn({
      variables,
    });
    if (!loading) {
      if (error) {
        setErrors(error);
        setLoading(false);
        throw error;
      } else {
        toaster.success('Column updated...', { duration: 2 });
      }
    }
  };

  const onSave = async values => {
    setErrors(null);
    setLoading(true);
    if (type === 'addColumn') {
      actions.setIsTableBuilding(true);
      for (let i = 0; i < columnFields; i += 1) {
        const isPrimaryKey =
          i === 0 ? values.isPrimaryKey : values[`isPrimaryKey_${i}`];
        const hasTable = i === 0 ? values.table : values[`table_${i}`];
        const hasColumn = i === 0 ? values.column : values[`column_${i}`];

        // eslint-disable-next-line no-await-in-loop
        const { loading, error } = await addOrCreateColumn({
          variables: {
            schemaName: schema.name,
            tableName: table.name,
            create: true,
            columnName: i === 0 ? values.name : values[`name_${i}`],
            columnLabel: i === 0 ? values.label : values[`label_${i}`],
            columnType: i === 0 ? values.type : values[`type_${i}`],
            isNotNullable:
              i === 0 ? values.isNotNullable : values[`isNotNullable_${i}`],
            skipTracking: true,
          },
        });
        if (!loading && !error) {
          toaster.success(
            `Column ${i === 0 ? values.name : values[`name_${i}`]} created...`,
            { duration: 2 },
          );
        }
        if (!loading) {
          if (error) setErrors(error);
          else {
            const columnNames = [];
            columns
              .filter(column => column.isPrimaryKey === true)
              .map(c => columnNames.push(c.name));
            if (isPrimaryKey) {
              // eslint-disable-next-line no-await-in-loop
              await createOrDeletePrimaryKeys({
                variables: {
                  schemaName: schema.name,
                  tableName: table.name,
                  del: true,
                  columnNames,
                },
              })
                .catch(e => setErrors(e))
                .then(async () => {
                  await createOrDeletePrimaryKeys({
                    variables: {
                      schemaName: schema.name,
                      tableName: table.name,
                      columnNames:
                        i === 0 ? values.name : [values[`name_${i}`]],
                    },
                  })
                    .catch(e => setErrors(e))
                    .then(() =>
                      toaster.notify(
                        `Primary Key ${
                          i === 0 ? values.name : values[`name_${i}`]
                        } created...`,
                        { duration: 2 },
                      ),
                    );
                });
            }
            if (hasTable && hasColumn) {
              // eslint-disable-next-line no-await-in-loop
              const { loading, error } = await createOrAddForeignKey({
                variables: {
                  schemaName: schema.name,
                  tableName: table.name,
                  columnNames: i === 0 ? [values.name] : [values[`name_${i}`]],
                  parentTableName: hasTable,
                  parentColumnNames: [hasColumn],
                  create: true,
                },
              });
              if (!loading && !error) {
                toaster.notify(
                  `Foreign Key ${
                    i === 0 ? values.name : values[`name_${i}`]
                  } created...`,
                  { duration: 2 },
                );
                gridAPI.refreshCells({ force: true });
              }
            }
          }
        }
      }
      Retrack();
    } else {
      const variables: any = {
        schemaName: schema.name,
        tableName: table.name,
        columnName: column,
        skipTracking: true,
      };
      const updatedPK = values.isPrimaryKey !== formData.isPrimaryKey;
      const updatedFK = !!(
        values.table !== formData.table && values.column !== formData.column
      );
      const col = columns.filter(c => c.name === column)[0];
      if (values.name !== col.name) variables.newColumnName = values.name;
      if (values.label !== col.label) variables.newColumnLabel = values.label;
      if (values.type !== col.type) variables.newType = values.type;
      if (values.isNotNullable !== col.isNotNullable)
        variables.newIsNotNullable = values.isNotNullable;

      if (
        (variables.newColumnName ||
          variables.newColumnLabel ||
          variables.newType) &&
        (updatedPK || updatedFK)
      ) {
        const { loading, error } = await updateColumn({
          variables,
        });
        if (!loading) {
          if (error) {
            setErrors(error);
            setLoading(false);
            throw error;
          } else {
            if (values.autoIncrement) {
              const vars: any = {
                schemaName: schema.name,
                tableName: table.name,
                columnName: values.name,
              };
              if (formData.startSequenceNumber)
                vars.nextSeqNumber = parseInt(values.startSequenceNumber, 10);
              await addOrRemoveColumnSequence({ variables: vars });
            } else if (values.default) {
              await addOrRemoveColumnSequence({
                variables: {
                  schemaName: schema.name,
                  tableName: table.name,
                  columnName: values.name,
                  remove: true,
                },
              });
            } else if (updatedPK) {
              await updatePrimaryKey(values);
            } else if (updatedFK) {
              await updateForeignKey(values);
            }

            refetchColumns().finally(() => {
              setLoading(false);
              gridAPI.refreshCells({ force: true });
              actions.setShow(false);
              if (values.name !== col.name) {
                Retrack();
              }
            });
          }
        }
      } else if (values.isPrimaryKey !== formData.isPrimaryKey) {
        // In case only primary key has to be updated.
        await updatePrimaryKey(values);
      } else if (
        values.table !== formData.table &&
        values.column !== formData.column
      ) {
        // In case only foreign key has to be updated.
        await updateForeignKey(values);
      } else if (
        variables.newColumnName ||
        variables.newColumnLabel ||
        variables.newType
      ) {
        // In case only column details (name, label, type) has to be updated
        await updateColumnInfo(variables);
      }

      refetchColumns().finally(() => {
        setLoading(false);
        gridAPI.refreshCells({ force: true });
        actions.setShow(false);
        if (values.name !== col.name) {
          Retrack();
        }
      });
    }
  };

  return (
    <FormMaker
      key={value.name + type}
      errors={errors}
      setErrors={setErrors}
      isLoading={isLoading}
      name={value.name}
      fields={value.fields}
      initialValues={value.initialValues}
      columnType={type}
      validationSchema={value.validationSchema}
      onSubmit={onSave}
    />
  );
};

const mapStateToProps = state => ({
  type: state.type,
  formData: state.formData,
  schema: state.schema,
  table: state.table,
  tables: state.tables,
  column: state.column,
  columns: state.columns,
  cloudContext: state.cloudContext,
  gridAPI: state.gridAPI,
  columnFields: state.columnFields,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuthenticationRequired(ColumnForm));
