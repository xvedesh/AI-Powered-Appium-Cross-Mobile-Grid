import { ENV_DATA as stageData } from './envs/stage';
import { ENV_DATA as qaData } from './envs/qa';

const environments = {
    stage: stageData,
    qa: qaData
};

// Prefer TEST_ENV, keep NODE_ENV fallback for backward compatibility.
const requestedEnv = (process.env.TEST_ENV ?? process.env.NODE_ENV ?? 'qa').toLowerCase();
const aliases: Record<string, keyof typeof environments> = {
    test: 'qa',
    dev: 'qa',
    development: 'qa',
    prod: 'stage',
    production: 'stage'
};

const currentEnv = (aliases[requestedEnv] ?? requestedEnv) as keyof typeof environments;

// Do not crash spec loading for unknown env names; fallback to qa.
if (!(currentEnv in environments)) {
    console.warn(`>>> [WARN]: Unknown TEST_ENV/NODE_ENV="${requestedEnv}". Falling back to "qa".`);
}

export const ENV = environments[currentEnv in environments ? currentEnv : 'qa'];

if (ENV.apiToken === 'PUT_TOKEN_HERE') {
    console.warn(`>>> [WARN]: ${ENV.envName} API token is placeholder. Set TEST_ENV-specific token or API_TOKEN.`);
}
