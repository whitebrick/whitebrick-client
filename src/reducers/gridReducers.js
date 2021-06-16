import { types } from '../types/gridTypes';

export default function gridReducer(state = {}, action) {
  const payload = action.payload;
  switch (action.type) {
    case types.SET_ORGANIZATIONS:
      return {
        ...state,
        organizations: payload.organizations,
      };
    case types.SET_ORGANIZATION:
      return {
        ...state,
        organization: payload.organization,
      };
    case types.SET_TOKEN_CLAIMS:
      return {
        ...state,
        tokenClaims: payload.tokenClaims,
      };
    case types.SET_IS_NEW_TABLE:
      return {
        ...state,
        isNewTable: payload.isNewTable,
      };
    case types.SET_USER:
      return {
        ...state,
        user: payload.user,
      };
    case types.SET_FORM_DATA:
      return {
        ...state,
        formData: payload.formData,
      };
    case types.SET_ACCESS_TOKEN:
      return {
        ...state,
        accessToken: payload.accessToken,
      };
    case types.SET_ROWS:
      return {
        ...state,
        rowData: payload.rows,
      };
    case types.SET_SCHEMA:
      return {
        ...state,
        schema: payload.schema,
      };
    case types.SET_TABLES:
      return {
        ...state,
        tables: payload.tables,
      };
    case types.SET_TABLE:
      return {
        ...state,
        table: payload.table,
      };
    case types.SET_COLUMNS:
      let f = [];
      payload.columns.forEach(column => f.push(column.name));
      return {
        ...state,
        columns: payload.columns,
        fields: f,
      };
    case types.SET_ROW_COUNT:
      return {
        ...state,
        rowCount: payload.rowCount,
      };
    case types.SET_CURRENT:
      return {
        ...state,
        currentPage: payload.current,
      };
    case types.SET_ORDER_BY:
      return {
        ...state,
        orderBy: payload.orderBy,
      };
    case types.SET_LIMIT:
      return {
        ...state,
        limit: payload.limit,
      };
    case types.SET_OFFSET:
      return {
        ...state,
        offset: payload.offset,
      };
    case types.SET_VIEWS:
      return {
        ...state,
        views: payload.views,
      };
    case types.SET_VIEW:
      return {
        ...state,
        views: [...state.views, payload.view],
      };
    case types.SET_DEFAULT_VIEW:
      return {
        ...state,
        defaultView: payload.defaultView,
      };
    default:
      return state;
  }
}
