import { createStore } from 'redux';
import gridReducer from '../reducers/gridReducers';

const initialState = {
  user: '',
  schema: '',
  tables: [],
  table: '',
  columns: [],
  rowData: [],
  rowCount: 0,
  current: 1,
  orderBy: '',
  limit: 10,
  offset: 0,
  views: [],
  defaultView: 'Default View',
};

export default createStore(gridReducer, initialState);
