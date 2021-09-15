export const formatError = jsonError => {
  let message = `**${jsonError.name}**\n\n`;
  message += `**URL:** ${jsonError.config.url}\n`;
  message += `**Data:** ${jsonError.config.data}\n`;
  message += `**Status Code:** ${jsonError.code}\n`;
  message += `**Message:** ${jsonError.message}\n`;
  message += `**Stack:** \n ${jsonError.stack}\n`;
  return message;
};
