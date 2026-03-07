export const ENV_DATA = {
    envName: 'STAGE',
    baseUrl: 'https://www.saucedemo.com/?env=stage',
    apiToken: process.env.STAGE_API_TOKEN ?? process.env.API_TOKEN ?? 'PUT_TOKEN_HERE',
    dbName: 'stage_db'
};
