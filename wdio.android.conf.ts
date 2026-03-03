import { config as baseConfig } from './wdio.conf';
import { androidCaps } from './test/config/android.caps';

export const config = {
    ...baseConfig,
    capabilities: [androidCaps],
    // Явно копируем хук, чтобы TS/CommonJS его не потерял
    afterTest: baseConfig.afterTest 
}