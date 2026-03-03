import { ENV_DATA as stageData } from './envs/stage';
import { ENV_DATA as qaData } from './envs/qa';

const environments = {
    stage: stageData,
    qa: qaData
};

// По умолчанию берем 'qa', если ничего не передано
const currentEnv = process.env.NODE_ENV || 'qa';

// Проверяем, существует ли такая среда
if (!(currentEnv in environments)) {
    throw new Error(`Environment "${currentEnv}" is not defined in env.provider.ts`);
}

export const ENV = environments[currentEnv as keyof typeof environments];

if (ENV.apiToken === 'PUT_TOKEN_HERE') {
    console.warn(`>>> [WARN]: ${ENV.envName} API token is placeholder. Set ${ENV.envName}_API_TOKEN or API_TOKEN.`);
}
