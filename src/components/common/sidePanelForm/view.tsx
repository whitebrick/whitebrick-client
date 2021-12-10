import React, { useState } from 'react';
import { toaster } from 'evergreen-ui';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { ColumnApi } from 'ag-grid-community';
import { useMutation } from 'graphql-hooks';
import * as Yup from 'yup';
import FormMaker from '../../elements/formMaker';
import { placeholders } from './placeholders';
import { SchemaItemType, TableItemType } from '../../../types';
import { actions } from '../../../state/actions';
import { SAVE_TABLE_USER_SETTINGS } from '../../../graphql/mutations/wb';

type ViewFormPropsType = {
  schema: SchemaItemType;
  table: TableItemType;
  views: any[];
  defaultView: string;
  columnAPI: ColumnApi;
  orderBy: string;
  limit: number;
  offset: string;
  actions: any;
};

const ViewForm = ({
  schema,
  table,
  views,
  defaultView,
  columnAPI,
  orderBy,
  limit,
  offset,
  actions,
}: ViewFormPropsType) => {
  const [isLoading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  const [saveUserTableSettings] = useMutation(SAVE_TABLE_USER_SETTINGS);

  const saveSettingsToDB = async () => {
    setErrors(null);
    setLoading(true);
    const { loading, error } = await saveUserTableSettings({
      variables: {
        schemaName: schema.name,
        tableName: table.name,
        settings: {
          views,
          defaultView,
        },
      },
    });
    if (!loading) {
      setLoading(false);
      if (error) setErrors(error);
      else
        toaster.success('Saved!', {
          duration: 10,
        });
    }
  };

  const saveView = (name, toView = null) => {
    if (toView) {
      let viewObj = views.filter(view => view.name === toView)[0];
      const index = views.indexOf(viewObj);
      if (index !== -1) {
        viewObj = {
          name: toView,
          state: columnAPI.getColumnState(),
          orderBy,
          limit,
          offset,
        };
        const v = views;
        v[index] = viewObj;
        actions.setViews(v);
      }
    } else {
      const viewObj = {
        name,
        state: columnAPI.getColumnState(),
        orderBy,
        limit,
        offset,
      };
      actions.setView(viewObj);
      actions.setDefaultView(name);
    }
    saveSettingsToDB().then(() => actions.setShow(false));
  };

  return (
    <FormMaker
      isLoading={isLoading}
      errors={errors}
      name={`Create a new view in ${table.label}`}
      fields={[
        {
          name: 'name',
          label: 'Name of the view',
          type: 'text',
          placeholder: `${placeholders.viewName}`,
          required: true,
        },
      ]}
      initialValues={{ name: '' }}
      validationSchema={Yup.object().shape({
        name: Yup.string().required(),
      })}
      onSubmit={values => saveView(values.name)}
    />
  );
};

const mapStateToProps = state => ({
  schema: state.schema,
  table: state.table,
  columnAPI: state.columnAPI,
  orderBy: state.orderBy,
  limit: state.limit,
  offset: state.offset,
  views: state.views,
  defaultView: state.defaultView,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuthenticationRequired(ViewForm));
