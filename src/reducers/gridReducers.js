import { types } from "../types/gridTypes"

export default function gridReducer(state = {}, action) {
  const payload = action.payload;
  switch (action.type) {
    case types.SET_USER:
      return {
        ...state,
        user: payload.user
      };
    case types.SET_ROWS:
      return {
        ...state,
        rowData: payload.rows
      };
    case types.SET_SCHEMA:
      return {
        ...state,
        schema: payload.schema
      };
    case types.SET_TABLES:
      return {
        ...state,
        tables: payload.tables
      };
    case types.SET_TABLE:
      return {
        ...state,
        table: payload.table
      };
    case types.SET_FIELDS:
      return {
        ...state,
        fields: payload.fields
      };
    default:
      return state;
  }
}
