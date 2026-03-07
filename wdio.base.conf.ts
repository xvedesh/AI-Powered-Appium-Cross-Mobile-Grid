import 'dotenv/config';
import path from 'path';
import { spawn } from 'child_process';
import allureReporter from '@wdio/allure-reporter';
import ContextCollector from './test/util/ContextCollector';
import { PlatformTarget, parseServerUrl, resolveAppiumServer } from './test/config/server.provider';

type CreateWdioConfigOptions = {
    platform: PlatformTarget;
    capabilities: WebdriverIO.Capabilities[];
};

const toArtifactKey = (platform: PlatformTarget): string => platform.replace(/[^a-z0-9-]/gi, '-');

const toLegacyPlatformLabel = (platform: PlatformTarget): string => {
    if (platform.startsWith('ios')) return 'ios';
    if (platform.startsWith('android')) return 'android';
    return platform;
};

export const createWdioConfig = ({ platform, capabilities }: CreateWdioConfigOptions): WebdriverIO.Config => {
    const testEnv = (process.env.TEST_ENV ?? process.env.NODE_ENV ?? 'qa').toLowerCase();
    const appiumServer = resolveAppiumServer(platform);
    const defaultBasePath = platform.startsWith('android')
        ? (process.env.ANDROID_APPIUM_BASE_PATH ?? process.env.APPIUM_BASE_PATH ?? '/wd/hub')
        : (process.env.IOS_APPIUM_BASE_PATH ?? process.env.APPIUM_BASE_PATH ?? '/');
    const parsedServer = parseServerUrl(appiumServer, { defaultPath: defaultBasePath });

    const isExplicitRemoteServer = Boolean(
        process.env.APPIUM_SERVER || process.env.IOS_APPIUM_SERVER || process.env.ANDROID_APPIUM_SERVER
    );

    process.env.PLATFORM = toLegacyPlatformLabel(platform);
    process.env.TEST_PLATFORM = platform;

    const artifactKey = toArtifactKey(platform);
    const allureResultsDir = process.env.ALLURE_RESULTS_DIR ?? `allure-results/${artifactKey}`;
    const allureReportDir = process.env.ALLURE_REPORT_DIR ?? `allure-report/${artifactKey}`;
    const errorShotsDir = process.env.ERROR_SHOTS_DIR ?? path.join('test', 'errorShots', artifactKey);

    process.env.ALLURE_RESULTS_DIR = allureResultsDir;
    process.env.ALLURE_REPORT_DIR = allureReportDir;
    process.env.ERROR_SHOTS_DIR = errorShotsDir;

    console.log(`>>> [INFO]: Resolved PLATFORM=${platform}`);
    console.log(`>>> [INFO]: Resolved TEST_ENV=${testEnv}`);
    console.log(`>>> [INFO]: Resolved APPIUM_SERVER=${parsedServer.href}`);
    console.log(`>>> [INFO]: Appium host=${parsedServer.hostname}`);
    console.log(`>>> [INFO]: Appium port=${parsedServer.port}`);
    console.log(`>>> [INFO]: Appium path=${parsedServer.path}`);
    console.log(`>>> [INFO]: Allure results dir=${allureResultsDir}`);
    console.log(`>>> [INFO]: Allure report dir=${allureReportDir}`);
    console.log(`>>> [INFO]: Error shots dir=${errorShotsDir}`);

    return {
        runner: 'local',
        tsConfigPath: './tsconfig.json',
        hostname: parsedServer.hostname,
        port: parsedServer.port,
        path: parsedServer.path,
        specs: ['./test/specs/**/*.ts'],
        maxInstances: 1,
        logLevel: 'info',
        waitforTimeout: 10000,
        connectionRetryTimeout: 300000,
        connectionRetryCount: 1,
        services: isExplicitRemoteServer ? [] : ['appium'],
        framework: 'mocha',
        capabilities,

        reporters: [
            'spec',
            ['allure', {
                outputDir: allureResultsDir,
                disableWebdriverStepsReporting: true,
                disableWebdriverScreenshotsReporting: false
            }]
        ],

        mochaOpts: {
            ui: 'bdd',
            timeout: 120000,
            retries: 0
        },

        onPrepare: function () {
            if (isExplicitRemoteServer) {
                console.log(`>>> [PREPARE]: Remote Appium mode. Skipping local setup. Server: ${parsedServer.href}`);
                return;
            }

            console.log('>>> [PREPARE]: Local Appium mode. WDIO Appium service will be used.');
        },

        afterTest: async function (test, _context, { error, passed }) {
            if (!passed) {
                const msg = error ? error.message : 'Unknown Error';

                try {
                    await ContextCollector.collectErrorContext(test.title, msg);
                    allureReporter.addAttachment(
                        'AI Failure Diagnosis',
                        `AI analysis is scheduled post-run. See updated manifest in ${errorShotsDir}.`,
                        'text/plain'
                    );
                } catch (err) {
                    console.error('>>> [HOOK ERROR]:', err);
                }
            }
        },

        after: async function (result) {
            const postRunAiEnabled = (process.env.POST_RUN_AI ?? 'false').toLowerCase() === 'true';

            if (postRunAiEnabled) {
                const analyzerScript = path.join(process.cwd(), 'test', 'util', 'postRunAIAnalyzer.js');
                const child = spawn(process.execPath, [analyzerScript], {
                    detached: true,
                    stdio: 'ignore',
                    env: process.env
                });
                child.unref();
                console.log('>>> [POST-RUN AI]: Analyzer started in background.');
                console.log(`>>> [POST-RUN AI]: Follow progress in ${path.join(errorShotsDir, 'post-run-ai.log')}`);
            } else {
                console.log('>>> [POST-RUN AI]: Disabled. Set POST_RUN_AI=true to enable background analyzer.');
            }

            console.log(`>>> [GLOBAL HOOK] Tests finished. Result: ${result}`);
        }
    };
};
