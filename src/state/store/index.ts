import { createStore } from 'redux';
import gridReducer from '../reducers/gridReducers';

const initialState = {
  user: '',
  accessToken: '',
  tokenClaims: {},
  formData: {},
  schema: {},
  schemas: [],
  tables: [],
  table: '',
  isNewTable: false,
  columns: [],
  fields: [],
  rowData: [],
  rowCount: 0,
  current: 1,
  orderBy: '',
  limit: 10,
  offset: 0,
  views: [],
  cloudContext: {},
  organization: {},
  organizations: [],
  defaultView: 'Default View',
  sendAdminSecret: false,
  columnAPI: null,
  gridAPI: null,
  show: false,
  type: '',
};

export default createStore(gridReducer, initialState);
