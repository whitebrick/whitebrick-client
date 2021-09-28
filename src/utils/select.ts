import store from '../state/store';

export const parseOptions = options => {
  const opts = [];
  opts.push({ key: '--', value: '--' });
  options.map(option =>
    opts.push({ key: option.label, value: option.name, ...option }),
  );
  return opts;
};

export const getOrganizationValue = name => {
  const { organizations } = store.getState();
  const opts = [];
  organizations
    .filter(org => org.name === name)
    .map(org => opts.push({ key: org.label, value: org.name, ...org }));
  return opts[0];
};

export const getSchemaValue = name => {
  const { schemas } = store.getState();
  const opts = [];
  schemas
    .filter(schema => schema.name === name)
    .map(schema =>
      opts.push({ key: schema.label, value: schema.name, ...schema }),
    );
  return opts[0];
};
