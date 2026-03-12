import 'dotenv/config';
import path from 'path';
import allureReporter from '@wdio/allure-reporter';
import ContextCollector from './test/util/ContextCollector';
import { PlatformTarget, parseServerUrl, resolveAppiumServer } from './test/config/server.provider';

type CreateWdioConfigOptions = {
    platform: PlatformTarget;
    capabilities: WebdriverIO.Capabilities[];
};

const toArtifactKey = (platform: PlatformTarget): string => platform.replace(/[^a-z0-9-]/gi, '-');

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

    process.env.PLATFORM = platform;

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
                const postRunAiEnabled = (process.env.POST_RUN_AI ?? 'false').toLowerCase() === 'true';

                try {
                    await ContextCollector.collectErrorContext(test.title, msg);
                    allureReporter.addAttachment(
                        'AI Failure Diagnosis',
                        postRunAiEnabled
                            ? `AI analysis will run after the test execution completes. Generate the Allure report after the run finishes to see the diagnosis.`
                            : `AI analysis is disabled. Set POST_RUN_AI=true to include the diagnosis in the Allure report.`,
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
                console.log('>>> [POST-RUN AI]: Starting synchronous post-run analyzer.');
                console.log(`>>> [POST-RUN AI]: Progress log: ${path.join(errorShotsDir, 'post-run-ai.log')}`);

                try {
                    const { runPostRunAIAnalysis } = require('./test/util/postRunAIAnalyzer.js');
                    const analysisResult = await runPostRunAIAnalysis();
                    if (analysisResult.processed > 0) {
                        console.log(`>>> [POST-RUN AI]: Completed. Updated ${analysisResult.processed} manifest(s).`);
                        console.log(`>>> [POST-RUN AI]: ${analysisResult.readyMessage}`);
                    } else {
                        console.log('>>> [POST-RUN AI]: No pending manifests found.');
                    }
                } catch (error) {
                    console.error('>>> [POST-RUN AI ERROR]:', error);
                }
            } else {
                console.log('>>> [POST-RUN AI]: Disabled. Set POST_RUN_AI=true to include the diagnosis in the Allure report.');
            }

            console.log(`>>> [GLOBAL HOOK] Tests finished. Result: ${result}`);
        }
    };
};
