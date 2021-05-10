import { types } from '../types/gridTypes'

export const actions = {
  setRows(rows) {
    return {
      type: types.SET_ROWS,
      payload: { rows }
    };
  },
};
