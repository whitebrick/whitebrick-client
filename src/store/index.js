import { createStore } from 'redux';
import gridReducer from '../reducers/gridReducers';

const initialState = {
  user: '',
  rowData: [],
  schema: '',
  tables: [],
  table: '',
  fields: [],
};

export default createStore(gridReducer, initialState);
