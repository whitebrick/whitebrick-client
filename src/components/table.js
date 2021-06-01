import React, { useEffect, useState } from 'react';
import * as gql from 'gql-query-builder';
import { FaChevronRight, FaPen } from 'react-icons/fa';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions } from '../actions/index';

import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';

import { useMutation, useSubscription } from 'graphql-hooks';
import Pagination from 'rc-pagination';

import graphQLFetch from '../utils/GraphQLFetch';
import { UPDATE_TABLE_DETAILS_MUTATION } from '../graphql/mutations/table';
import SidePanel from './sidePanel';
import FormMaker from './formMaker';

const newTableColumnFields = [
  { name: 'name', label: 'Column Name', type: 'text', required: true },
  {
    name: 'type',
    label: 'Column Type',
    type: 'select',
    options: ['string', 'integer', 'datetime', 'date', 'timestamp'],
  },
];

const updateTableFields = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    required: true,
    readOnly: true,
  },
  { name: 'label', label: 'Label', type: 'text', required: true },
];

const Table = ({
  table,
  rows,
  fields,
  rowCount,
  current,
  orderBy,
  limit,
  offset,
  views,
  schema,
  defaultView,
  actions,
}) => {
  const [columnAPI, setColumnAPI] = useState(null);
  const [changedValues, setChangedValues] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [formData, setFormData] = useState({});
  const [show, setShow] = useState(false);
  const [column, setColumn] = useState('');
  const [columns, setColumns] = useState(
    rows.length > 0 ? Object.keys(rows[0]) : [],
  );
  const [updateTableMutation] = useMutation(UPDATE_TABLE_DETAILS_MUTATION);

  useEffect(() => {
    const handleTableChange = async () => {
      if (fields.length > 0) {
        let orderByParameter = fields.includes(orderBy) ? orderBy : fields[0];
        actions.setOrderBy(orderByParameter);
        let orderByType = schema + '_' + table.name.concat('_order_by!');
        const operation = gql.query({
          operation: schema + '_' + table.name,
          variables: {
            limit,
            offset,
            order_by: {
              value: { [orderByParameter]: `asc` },
              type: `[${orderByType}]`,
            },
          },
          fields,
        });
        const operationAgg = gql.query({
          operation: schema + '_' + table.name.concat('_aggregate'),
          fields: [{ aggregate: ['count'] }],
        });
        const fetchData = async () => await graphQLFetch(operation);
        fetchData().then(({ data }) => {
          actions.setRows(data[schema + '_' + table.name]);
          setColumns(Object.keys(data[schema + '_' + table.name][0]));
        });
        const fetchCount = async () => await graphQLFetch(operationAgg);
        fetchCount().then(({ data }) =>
          actions.setRowCount(
            data[schema + '_' + table.name + '_aggregate'].aggregate.count,
          ),
        );
      }
    };
    handleTableChange();
  }, [schema, table, fields, limit, offset, orderBy, actions]);

  useEffect(() => {
    actions.setOffset(0);
    actions.setCurrent(1);
  }, [table, actions]);

  const handlePagination = (current, pageSize) => {
    actions.setOffset(Math.ceil((current - 1) * pageSize));
    actions.setCurrent(current);
  };

  const doMutation = variables => {
    const operation = gql.mutation({
      operation: ''.concat('update_', schema + '_' + table.name),
      variables: {
        where: {
          value: variables.where,
          type: `${schema + '_' + table.name}_bool_exp`,
          required: true,
        },
        _set: {
          value: variables['_set'],
          type: `${schema + '_' + table.name}_set_input`,
        },
      },
      fields: ['affected_rows'],
    });
    const fetchData = async () =>
      await graphQLFetch({
        query: operation.query,
        variables: operation.variables,
      });
    fetchData();
  };

  const editValues = values => {
    values = [...new Set(values)];
    values.forEach((params, index) => {
      let filteredParams = values.filter(
        value => params.rowIndex === value.rowIndex,
      );
      let data = params.data;
      data[params.colDef?.field] = params.oldValue;
      filteredParams.forEach(param => {
        data[param.colDef?.field] = param.oldValue;
      });
      let variables = { where: {}, _set: {} };
      for (let key in data) {
        variables.where[key] = {
          _eq: parseInt(data[key]) ? parseInt(data[key]) : data[key],
        };
      }
      variables['_set'][params.colDef.field] = parseInt(params.newValue)
        ? parseInt(params.newValue)
        : params.newValue;
      filteredParams.forEach(param => {
        variables['_set'][param.colDef.field] = parseInt(param.newValue)
          ? parseInt(param.newValue)
          : param.newValue;
      });
      values.splice(index, 1);
      values = values.filter(el => !filteredParams.includes(el));
      setChangedValues(values);
      doMutation(variables);
    });
  };

  const onCellValueChanged = params => {
    let values = changedValues;
    values.push(params);
    setChangedValues(values);
    setTimeout(() => editValues(values), 500);
  };

  let orderByParameter = fields.includes(orderBy) ? orderBy : fields[0];
  const subscription = gql.subscription({
    operation: schema + '_' + table.name,
    variables: {
      limit,
      offset,
      order_by: {
        value: { [orderByParameter]: `asc` },
        type: `[${schema + '_' + table.name.concat('_order_by!')}]`,
      },
    },
    fields,
  });

  const saveView = (defaultView = null) => {
    if (defaultView) {
      let viewObj = views.filter(
        view =>
          view.table === schema + '_' + table.name && view.name === defaultView,
      )[0];
      let index = views.indexOf(viewObj);
      if (index !== -1) {
        viewObj = {
          table: schema + '_' + table.name,
          name: defaultView,
          state: columnAPI.getColumnState(),
          orderBy,
          limit,
        };
        views[index] = viewObj;
        actions.setViews(views);
      }
    } else {
      let viewObj = {
        table: schema + '_' + table.name,
        name,
        state: columnAPI.getColumnState(),
        orderBy,
        limit,
      };
      actions.setView(viewObj);
      actions.setDefaultView(name);
      setName('');
    }
  };

  const getContextMenuItems = params => {
    setFormData({});
    return [
      {
        name: 'Add Column',
        action: () => {
          setType('add');
          setShow(true);
          setColumn(params.column.colId);
        },
      },
      {
        name: 'Edit Column',
        action: () => {
          setType('edit');
          setShow(true);
          setFormData({ name: params.column.colId });
          setColumn(params.column.colId);
        },
      },
      {
        name: 'Remove Column',
        action: () => onRemove(params.column.colId),
      },
      'separator',
      {
        name: 'Add Row',
        action: () => onAddRow(),
      },
      {
        name: 'Delete Row',
        action: () => onDeleteRow(params),
      },
      'separator',
      'copy',
      'copyWithHeaders',
      'paste',
      'export',
    ];
  };

  const onSave = () => {
    if (type === 'newRow') {
      const operation = gql.mutation({
        operation: ''.concat('insert_', schema + '_' + table.name),
        variables: {
          objects: {
            value: formData,
            type: `[${schema + '_' + table.name}_insert_input!]`,
            required: true,
          },
        },
        fields: ['affected_rows'],
      });
      const fetchData = async () =>
        await graphQLFetch({
          query: operation.query,
          variables: operation.variables,
        });
      fetchData();
      setShow(false);
    } else if (type === 'updateTable') {
      const { loading, error } = updateTableMutation({
        variables: {
          schemaName: schema,
          tableName: table.name,
          newTableLabel: formData.label,
        },
      });
      if (!error && !loading) setShow(false);
    } else if (type === 'view') {
      saveView();
      setShow(false);
    } else {
      let col = columns.filter(c => c === column)[0];
      let index = columns.indexOf(col);
      columns.splice(index, 0, formData.name);
      setColumns(columns);
      setShow(false);
    }
  };

  const onEdit = () => {
    let col = columns.filter(c => c === column)[0];
    let index = columns.indexOf(col);
    columns.splice(index, 1, formData.name);
    setColumns(columns);
    setShow(false);
  };

  const onRemove = colID => {
    let col = columns.filter(c => c === colID)[0];
    let index = columns.indexOf(col);
    columns.splice(index, 1);
    setColumns(columns);
  };

  const onAddRow = () => {
    setType('newRow');
    setShow(true);
  };

  const onDeleteRow = params => {
    let variables = { where: {} };
    let data = params.node.data;
    for (let key in data) {
      variables.where[key] = {
        _eq: parseInt(data[key]) ? parseInt(data[key]) : data[key],
      };
    }
    const operation = gql.mutation({
      operation: ''.concat('delete_', schema + '_' + table.name),
      variables: {
        where: {
          value: variables.where,
          type: `${schema + '_' + table.name}_bool_exp`,
          required: true,
        },
      },
      fields: ['affected_rows'],
    });
    const fetchData = async () =>
      await graphQLFetch({
        query: operation.query,
        variables: operation.variables,
      });
    fetchData();
  };

  useSubscription(subscription, ({ data, errors }) => {
    if (errors && errors.length > 0) {
      console.log(errors);
      return;
    }
    actions.setRows(data[schema + '_' + table.name]);
  });

  return (
    <div className="ag-theme-alpine">
      {table !== '' && rows.length > 0 && (
        <React.Fragment>
          <div className="my-3">
            <div style={{ padding: `1rem` }}>
              <p>
                Databases <FaChevronRight /> {schema} <FaChevronRight />{' '}
                {table.name.toLowerCase()}
              </p>
              <h3
                className="m-0 w-25"
                aria-hidden={true}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setType('updateTable');
                  setFormData(table);
                  setShow(true);
                }}>
                <span>
                  {table.label}
                  <FaPen className="ml-1" size="15px" />
                </span>
              </h3>
              <p className="p-1">Total {rowCount} records</p>
              <div>
                {views.length > 0 &&
                  views.map(view => {
                    if (view.table === schema + '_' + table.name)
                      return (
                        <div
                          onClick={() => {
                            columnAPI.applyColumnState({
                              state: view.state,
                              applyOrder: true,
                            });
                            actions.setLimit(view.limit);
                            actions.setOrderBy(view.orderBy);
                            actions.setDefaultView(view.name);
                          }}
                          aria-hidden="true"
                          className={`badge badge-pill mr-1 p-2 ${
                            defaultView === view.name
                              ? 'badge-primary'
                              : 'badge-secondary'
                          }`}
                          style={{ cursor: 'pointer' }}>
                          {view.name}
                        </div>
                      );
                  })}
                <div
                  onClick={() => {
                    setType('view');
                    setFormData({});
                    setShow(true);
                  }}
                  aria-hidden="true"
                  className="badge badge-pill badge-dark p-2"
                  style={{ cursor: 'pointer' }}>
                  + Create a view
                </div>
                <div className="float-right">
                  <div
                    onClick={() => saveView(defaultView)}
                    aria-hidden="true"
                    className="badge badge-dark p-2 mr-2"
                    style={{ cursor: 'pointer' }}>
                    Save to {defaultView}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <AgGridReact
            rowData={rows}
            sideBar
            enableRangeSelection
            enableFillHandle
            undoRedoCellEditing
            undoRedoCellEditingLimit={20}
            defaultColDef={{
              flex: 1,
              minWidth: 100,
              editable: true,
              resizable: true,
              sortable: true,
              filter: true,
            }}
            sortingOrder={['desc', 'asc', null]}
            onCellValueChanged={onCellValueChanged}
            domLayout={'autoHeight'}
            animateRows={true}
            allowContextMenuWithControlKey={true}
            getContextMenuItems={getContextMenuItems}
            popupParent={document.querySelector('body')}
            onGridReady={params => {
              setColumnAPI(params.columnApi);
              if (
                views.filter(
                  view =>
                    view.name === 'Default View' &&
                    view.table === schema + '_' + table.name,
                ).length <= 0
              ) {
                let viewObj = {
                  table: schema + '_' + table.name,
                  name: 'Default View',
                  state: params.columnApi.getColumnState(),
                  orderBy,
                  limit,
                };
                actions.setView(viewObj);
              }
            }}>
            {columns.map(key => (
              <AgGridColumn field={key} key={key} />
            ))}
          </AgGridReact>
        </React.Fragment>
      )}
      {table !== '' && rows.length > 0 && (
        <div className="p-4">
          <select
            value={limit}
            onBlur={e => actions.setLimit(parseInt(e.target.value))}
            onChange={e => actions.setLimit(parseInt(e.target.value))}>
            <option>5</option>
            <option>10</option>
            <option>20</option>
            <option>50</option>
            <option>100</option>
            <option>500</option>
          </select>{' '}
          records per page
          <div className="float-right px-2">
            <select
              value={orderBy}
              onBlur={e => actions.setOrderBy(e.target.value)}
              onChange={e => actions.setOrderBy(e.target.value)}>
              {fields.map(f => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div className="float-right">
            <Pagination
              total={rowCount}
              pageSize={limit}
              current={current}
              onChange={(current, pageSize) =>
                handlePagination(current, pageSize)
              }
            />
          </div>
        </div>
      )}
      <SidePanel
        show={show}
        setShow={setShow}
        onSave={onSave}
        onEdit={onEdit}
        type={type}
        name={
          type === 'add'
            ? `Add column to '${table.name}'`
            : type === 'newRow'
            ? `Add new row to '${table.name}'`
            : type === 'edit'
            ? `Edit column '${column}'`
            : type === 'view'
            ? `Create a new view`
            : `Update table '${table.name}'`
        }>
        {type === 'newRow' ? (
          <React.Fragment>
            {columns.map(c => (
              <div className="mt-3">
                <label>{c}</label>
                <input
                  className="form-control"
                  value={formData ? formData[c] : ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      [c]: parseInt(e.target.value)
                        ? parseInt(e.target.value)
                        : e.target.value,
                    })
                  }
                />
              </div>
            ))}
          </React.Fragment>
        ) : type === 'edit' || type === 'add' ? (
          <FormMaker
            formData={formData}
            setFormData={setFormData}
            fields={newTableColumnFields}
          />
        ) : type === 'view' ? (
          <FormMaker
            formData={formData}
            setFormData={setFormData}
            fields={[
              {
                name: 'name',
                label: 'Name of the view',
                type: 'text',
                required: true,
              },
            ]}
          />
        ) : (
          <FormMaker
            formData={formData}
            setFormData={setFormData}
            fields={updateTableFields}
          />
        )}
      </SidePanel>
    </div>
  );
};

const mapStateToProps = state => ({
  rows: state.rowData,
  table: state.table,
  fields: state.fields,
  rowCount: state.rowCount,
  current: state.current,
  orderBy: state.orderBy,
  limit: state.limit,
  offset: state.offset,
  views: state.views,
  schema: state.schema,
  defaultView: state.defaultView,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Table);
