import allureReporter from '@wdio/allure-reporter'
import ContextCollector from './test/util/ContextCollector'
import 'dotenv/config'
import { execSync } from 'child_process'

const getCapabilities = () => {
    const platform = process.env.PLATFORM ? process.env.PLATFORM.toLowerCase() : 'android';
    console.log(`>>> [INFO]: Running tests on platform: ${platform.toUpperCase()}`);

    if (platform === 'ios') {
        const { iosCaps } = require('./test/config/ios.caps');
        return [iosCaps];
    }

    const { androidCaps } = require('./test/config/android.caps');
    return [androidCaps];
};

const appiumServerUrl = process.env.APPIUM_SERVER;
const parsedAppiumServer = appiumServerUrl ? new URL(appiumServerUrl) : null;

export const config: WebdriverIO.Config = {
    runner: 'local',
    tsConfigPath: './tsconfig.json',
    hostname: parsedAppiumServer?.hostname ?? '127.0.0.1',
    port: Number(parsedAppiumServer?.port ?? process.env.APPIUM_PORT ?? 4723),
    path: parsedAppiumServer?.pathname || '/',
    specs: ['./test/specs/**/*.ts'],
    logLevel: 'info',
    waitforTimeout: 10000,
    connectionRetryTimeout: 300000,
    connectionRetryCount: 1,
    services: ['appium'],
    framework: 'mocha',
    capabilities: getCapabilities(),

    reporters: [
        'spec',
        ['allure', {
            outputDir: 'allure-results',
            disableWebdriverStepsReporting: true,
            disableWebdriverScreenshotsReporting: false,
        }]
    ],

    mochaOpts: {
        ui: 'bdd',
        timeout: 60000,
        retries: 0
    },

    onPrepare: function (_config, _capabilities) {
        const platform = process.env.PLATFORM ? process.env.PLATFORM.toLowerCase() : 'android';
        console.log(`>>> [PREPARE]: Checking environment for ${platform.toUpperCase()}...`);

        const cleanEnv = { ...process.env, NODE_OPTIONS: '' };

        try {
            // Самый надежный способ: получаем список драйверов в JSON формате
            const rawDrivers = execSync('./node_modules/.bin/appium driver list --installed --json', { env: cleanEnv }).toString();
            const drivers = JSON.parse(rawDrivers);
            
            // Проверяем наличие ключа в объекте JSON
            const isIosInstalled = drivers.hasOwnProperty('xcuitest');
            const isAndroidInstalled = drivers.hasOwnProperty('uiautomator2');

            if (platform === 'ios') {
                if (!isIosInstalled) {
                    console.log('>>> [PREPARE]: XCUITest driver not found. Installing...');
                    execSync('./node_modules/.bin/appium driver install xcuitest', { env: cleanEnv });
                } else {
                    console.log('>>> [PREPARE]: XCUITest driver is already installed.');
                }

                const runningDevices = execSync('xcrun simctl list devices', { env: cleanEnv }).toString();
                if (!runningDevices.includes('(Booted)')) {
                    console.log('>>> [PREPARE]: No booted simulator found. Booting iPhone 14...');
                    execSync('xcrun simctl boot "iPhone 14" || true', { env: cleanEnv });
                    execSync('open -a Simulator', { env: cleanEnv });
                }
            } else {
                if (!isAndroidInstalled) {
                    console.log('>>> [PREPARE]: UiAutomator2 driver not found. Installing...');
                    execSync('./node_modules/.bin/appium driver install uiautomator2', { env: cleanEnv });
                } else {
                    console.log('>>> [PREPARE]: UiAutomator2 driver is already installed.');
                }
            }
        } catch (error: any) {
            console.error('>>> [PREPARE ERROR]:', error?.message ?? error);
            throw error;
        }
    },

    afterTest: async function (test, _context, { error, passed }) {
        if (!passed) {
            const msg = error ? error.message : "Unknown Error";
            try {
                const manifest = await ContextCollector.collectErrorContext(test.title, msg);
                if (manifest && manifest.aiDiagnosis) {
                    allureReporter.addAttachment('AI Failure Diagnosis', manifest.aiDiagnosis, 'text/plain');
                }
            } catch (err) {
                console.error('>>> [HOOK ERROR]:', err);
            }
        }
    },

    after: async function (result, _capabilities, _specs) {
        console.log(`>>> [GLOBAL HOOK] Tests finished. Result: ${result}`);
    }
};
