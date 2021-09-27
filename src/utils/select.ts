import store from '../state/store';

export const getOrganizationValue = name => {
  const { organizations } = store.getState();
  const opts = [];
  organizations
    .filter(org => org.name === name)
    .map(org => opts.push({ key: org.label, value: org.name, ...org }));
  return opts[0];
};
