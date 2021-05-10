import { types } from "../types/gridTypes"

export default function gridReducer(state = {}, action) {
  const payload = action.payload;
  switch (action.type) {
    case types.SET_ROWS:
      return {
        rowData: payload.rows
      };
    default:
      return state;
  }
}
