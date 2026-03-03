export const ENV_DATA = {
    envName: 'STAGE',
    baseUrl: 'https://stage.api-demos.com', // Пример для API или Web
    apiToken: process.env.STAGE_API_TOKEN ?? process.env.API_TOKEN ?? 'PUT_TOKEN_HERE',
    dbName: 'stage_db'
};
