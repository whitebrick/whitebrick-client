import { types } from '../types/gridTypes';

export default function gridReducer(state = {}, action) {
  const payload = action.payload;
  switch (action.type) {
    case types.SET_USER:
      return {
        ...state,
        user: payload.user,
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
    case types.SET_FIELDS:
      return {
        ...state,
        fields: payload.fields,
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
    default:
      return state;
  }
}
