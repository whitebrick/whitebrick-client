import { types } from '../types/gridTypes';

export const actions = {
  setSendAdminSecret(sendAdminSecret) {
    return {
      type: types.SET_SEND_ADMIN_SECRET,
      payload: { sendAdminSecret },
    };
  },
  setOrganizations(organizations) {
    return {
      type: types.SET_ORGANIZATIONS,
      payload: { organizations },
    };
  },
  setOrganization(organization) {
    return {
      type: types.SET_ORGANIZATION,
      payload: { organization },
    };
  },
  setCloudContext(cloudContext) {
    return {
      type: types.SET_CLOUD_CONTEXT,
      payload: { cloudContext },
    };
  },
  setTokenClaims(tokenClaims) {
    return {
      type: types.SET_TOKEN_CLAIMS,
      payload: { tokenClaims },
    };
  },
  setIsNewTable(isNewTable) {
    return {
      type: types.SET_IS_NEW_TABLE,
      payload: { isNewTable },
    };
  },
  setAccessToken(accessToken) {
    return {
      type: types.SET_ACCESS_TOKEN,
      payload: { accessToken },
    };
  },
  setFormData(formData) {
    return {
      type: types.SET_FORM_DATA,
      payload: { formData },
    };
  },
  setUser(user) {
    return {
      type: types.SET_USER,
      payload: { user },
    };
  },
  setRows(rows) {
    return {
      type: types.SET_ROWS,
      payload: { rows },
    };
  },
  setColumn(column) {
    return {
      type: types.SET_COLUMN,
      payload: { column },
    };
  },
  setColumns(columns) {
    return {
      type: types.SET_COLUMNS,
      payload: { columns },
    };
  },
  setSchema(schema) {
    return {
      type: types.SET_SCHEMA,
      payload: { schema },
    };
  },
  setSchemas(schemas) {
    return {
      type: types.SET_SCHEMAS,
      payload: { schemas },
    };
  },
  setTables(tables) {
    return {
      type: types.SET_TABLES,
      payload: { tables },
    };
  },
  setTable(table) {
    return {
      type: types.SET_TABLE,
      payload: { table },
    };
  },
  setRowCount(rowCount) {
    return {
      type: types.SET_ROW_COUNT,
      payload: { rowCount },
    };
  },
  setOrderBy(orderBy) {
    return {
      type: types.SET_ORDER_BY,
      payload: { orderBy },
    };
  },
  setLimit(limit) {
    return {
      type: types.SET_LIMIT,
      payload: { limit },
    };
  },
  setOffset(offset) {
    return {
      type: types.SET_OFFSET,
      payload: { offset },
    };
  },
  setCurrent(current) {
    return {
      type: types.SET_CURRENT,
      payload: { current },
    };
  },
  setViews(views) {
    return {
      type: types.SET_VIEWS,
      payload: { views },
    };
  },
  setView(view) {
    return {
      type: types.SET_VIEW,
      payload: { view },
    };
  },
  setDefaultView(defaultView) {
    return {
      type: types.SET_DEFAULT_VIEW,
      payload: { defaultView },
    };
  },
  setColumnAPI(columnAPI) {
    return {
      type: types.SET_COLUMN_API,
      payload: { columnAPI },
    };
  },
  setGridAPI(gridAPI) {
    return {
      type: types.SET_GRID_API,
      payload: { gridAPI },
    };
  },
  setShow(show) {
    return {
      type: types.SET_SHOW,
      payload: { show },
    };
  },
  setType(type) {
    return {
      type: types.SET_TYPE,
      payload: { type },
    };
  },
  setParams(params) {
    return {
      type: types.SET_PARAMS,
      payload: { params },
    };
  },
};
