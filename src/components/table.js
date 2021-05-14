import React, { useEffect, useState } from 'react'
import * as gql from 'gql-query-builder'

import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import { actions } from '../actions/index'

import { AgGridColumn, AgGridReact } from 'ag-grid-react'
import 'ag-grid-enterprise';

import { useSubscription } from 'graphql-hooks'
import Pagination from 'rc-pagination';

import graphQLFetch from '../utils/GraphQLFetch';
import { Link } from "gatsby"

const Table = ({ table, rows, fields, actions }) => {
  const [count, setCount] = useState(0);
  const [current, setCurrent] = useState(1);
  const [orderBy, setOrderBy] = useState('');

  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleTableChange = async () => {
      if(fields.length > 0) {
        let orderByParameter = fields.includes(orderBy) ? orderBy: fields[0];
        let orderByType = table.concat('_order_by!')
        const operation = gql.query({
          operation: table,
          variables: { limit, offset, order_by: { value: { [orderByParameter]: `asc` } ,type: `[${orderByType}]` } },
          fields
        })
        const operationAgg = gql.query({
          operation: table.concat('_aggregate'),
          fields: [{ aggregate: [ 'count' ]}]
        })
        const fetchData = async () => await graphQLFetch(operation);
        fetchData().then(({ data }) => actions.setRows(data[table]));
        const fetchCount = async () => await graphQLFetch(operationAgg);
        fetchCount().then(({ data }) => setCount(data[table + '_aggregate'].aggregate.count));
      }
    };
    handleTableChange();
  }, [table, fields, limit, offset, orderBy, actions]);

  const handlePagination = (current, pageSize) => {
    setOffset(Math.ceil((current - 1) * pageSize))
    setCurrent(current);
  };

  const onCellValueChanged = (params) => {
    let data = params.data;
    data[params.colDef.field] = params.oldValue;
    let variables = { where: {}, _set: {} };
    for (let key in data) {
      variables.where[key] = {_eq: data[key]};
    }
    variables['_set'][params.colDef.field] = params.newValue;
    const operation = gql.mutation({
      operation: ''.concat('update_', table),
      variables: {
        where: { value: variables.where , type: `${table}_bool_exp`, required: true },
        _set: { value: variables['_set'], type: `${table}_set_input` }
      },
      fields: ['affected_rows']
    })
    const fetchData = async () => await graphQLFetch({ query: operation.query, variables: operation.variables });
    fetchData();
  };

  const onFirstDataRendered = (params) => {
    params.api.sizeColumnsToFit();
  };

  let orderByParameter = fields.includes(orderBy) ? orderBy: fields[0];
  const subscription = gql.subscription({
    operation: table,
    variables: { limit, offset, order_by: { value: { [orderByParameter]: `asc` } ,type: `[${table.concat('_order_by!')}]` } },
    fields
  });

  useSubscription(subscription, ({ data, errors }) => {
    if (errors && errors.length > 0) {
      console.log(errors);
      return
    }
    actions.setRows(data[table])
  });

  return (
    <div className="ag-theme-alpine">
      {table !== '' && rows.length > 0 ?
        <React.Fragment>
          <div className="card my-3 rounded-0">
            <div
              style={{ padding: `1rem` }}
            >
              <h3 style={{ margin: 0 }}>
                <Link
                  to="/"
                  style={{
                    color: `black`,
                    textDecoration: `none`,
                  }}
                >
                  {table}
                </Link>
              </h3>
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
            onFirstDataRendered={onFirstDataRendered}
            onCellValueChanged={onCellValueChanged}
            domLayout={'autoHeight'}
            animateRows={true}
            onGridReady={params => params.api.sizeColumnsToFit()}
          >
            {Object.keys(rows[0]).map(key => (
              <AgGridColumn field={key} key={key} />
            ))}
          </AgGridReact>
        </React.Fragment>
        : <p>Please select a table to render</p>
      }
      {table !== '' && rows.length > 0 &&
        <div className="p-4">
          <select value={limit} onChange={e => setLimit(parseInt(e.target.value))}>
            <option>5</option>
            <option>10</option>
            <option>20</option>
            <option>50</option>
            <option>100</option>
            <option>500</option>
          </select> records per page
          <div className="float-right px-2">
            <select value={orderBy} onChange={e => setOrderBy(e.target.value)}>
              {fields.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="float-right">
            <Pagination
              total={count}
              pageSize={limit}
              current={current}
              onChange={(current, pageSize) => handlePagination(current, pageSize)}
            />
          </div>
        </div>
      }
    </div>
  )
};

const mapStateToProps = (state) => ({
  rows: state.rowData,
  table: state.table,
  fields: state.fields
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(Table);
