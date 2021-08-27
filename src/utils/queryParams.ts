export const getQueryParams = (params: string) => {
  const parameters: any = {};
  params
    .substr(1)
    .split('&')
    .forEach(function queryParams(entry) {
      const eq = entry.indexOf('=');
      if (eq >= 0) {
        parameters[decodeURIComponent(entry.slice(0, eq))] = decodeURIComponent(
          entry.slice(eq + 1),
        );
      }
    });
  return parameters;
};
