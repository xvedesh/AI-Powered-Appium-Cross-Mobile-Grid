const iosAppPath = process.env.IOS_APP_PATH ?? process.env.APP_PATH;

if (!iosAppPath) {
    throw new Error(
        'IOS_APP_PATH or APP_PATH is required. Example: PLATFORM=ios APP_PATH=./apps/MyDemo.app npm test'
    );
}

export const iosCaps: WebdriverIO.Capabilities = {
    platformName: 'iOS',
    'appium:automationName': 'XCUITest',
    'appium:deviceName': process.env.IOS_DEVICE_NAME ?? process.env.DEVICE_NAME ?? 'iPhone 14',
    'appium:platformVersion': process.env.IOS_PLATFORM_VERSION ?? process.env.PLATFORM_VERSION ?? '16.2',
    'appium:app': iosAppPath,
    'appium:udid': process.env.IOS_UDID ?? process.env.UDID,
    'appium:noReset': (process.env.IOS_NO_RESET ?? 'true') === 'true',
    'appium:simulatorStartupTimeout': Number(process.env.IOS_SIMULATOR_STARTUP_TIMEOUT ?? 300000),
    'appium:wdaLaunchTimeout': Number(process.env.IOS_WDA_LAUNCH_TIMEOUT ?? 300000),
    'appium:wdaConnectionTimeout': Number(process.env.IOS_WDA_CONNECTION_TIMEOUT ?? 300000),
    'appium:newCommandTimeout': Number(process.env.NEW_COMMAND_TIMEOUT ?? 3600),
};
