export const CONFIG_ENDPOINT_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/api/config'
    : 'https://api.prompteasy.com/v1/config';
