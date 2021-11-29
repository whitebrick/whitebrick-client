import React from 'react';
import { ColumnApi } from 'ag-grid-community';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useMutation } from 'graphql-hooks';
import { toaster } from 'evergreen-ui';
import { actions } from '../../state/actions';
import { SAVE_TABLE_USER_SETTINGS } from '../../graphql/mutations/wb';
import { SchemaItemType, TableItemType } from '../../types';

type ViewButtonPropsType = {
  columnAPI: ColumnApi;
  view: any;
  views: any[];
  actions: any;
  defaultView: any;
  schema: SchemaItemType;
  table: TableItemType;
};

const ViewButton = ({
  columnAPI,
  view,
  actions,
  defaultView,
  views,
  schema,
  table,
}: ViewButtonPropsType) => {
  const viewName = view.name;
  const [saveUserTableSettings] = useMutation(SAVE_TABLE_USER_SETTINGS);

  const updateSettingsToDB = async () => {
    const { loading, error } = await saveUserTableSettings({
      variables: {
        schemaName: schema.name,
        tableName: table.name,
        settings: {
          views,
          defaultView: viewName,
        },
      },
    });
    if (error) {
      toaster.danger('Something went wrong when trying to update default view');
    }
  };

  const changeView = (view: any) => {
    actions.setDefaultView(view.name);
    updateSettingsToDB().then(() => {
      columnAPI.applyColumnState({
        state: view.state,
        applyOrder: true,
      });
      actions.setLimit(view.limit);
      actions.setOrderBy(view.orderBy);
    });
  };

  return (
    <div
      key={view.name}
      onClick={() => changeView(view)}
      aria-hidden="true"
      className={`badge badge-pill mr-1 p-2 ${
        defaultView === view.name ? 'badge-primary' : 'badge-secondary'
      }`}
      style={{ cursor: 'pointer' }}>
      {view.name}
    </div>
  );
};

const mapStateToProps = state => ({
  defaultView: state.defaultView,
  columnAPI: state.columnAPI,
  views: state.views,
  schema: state.schema,
  table: state.table,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ViewButton);
