import { createStore } from 'redux';
import gridReducer from '../reducers/gridReducers';

const initialState = {
  rowData: []
};

export default createStore(gridReducer, initialState);
