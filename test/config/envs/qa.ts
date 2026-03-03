export const ENV_DATA = {
    envName: 'QA',
    baseUrl: 'https://qa.api-demos.com',
    apiToken: process.env.QA_API_TOKEN ?? process.env.API_TOKEN ?? 'PUT_TOKEN_HERE',
    dbName: 'qa_db'
};
