const iosAppPath = process.env.IOS_APP_PATH ?? process.env.APP_PATH;

if (!iosAppPath) {
    throw new Error(
        'IOS_APP_PATH (or APP_PATH) is required for ios-native. Example: IOS_APP_PATH="/Users/user/apps/My Demo App.app"'
    );
}

export const iosNativeCaps: WebdriverIO.Capabilities = {
    platformName: 'iOS',
    'appium:automationName': 'XCUITest',
    'appium:deviceName': process.env.IOS_DEVICE_NAME ?? 'iPhone 14 Pro Max',
    'appium:platformVersion': process.env.IOS_PLATFORM_VERSION ?? '16.2',
    'appium:app': iosAppPath,
    'appium:udid': process.env.IOS_UDID,
    'appium:noReset': (process.env.IOS_NO_RESET ?? 'false') === 'true',
    'appium:newCommandTimeout': Number(process.env.NEW_COMMAND_TIMEOUT ?? 3600),
    'appium:simulatorStartupTimeout': Number(process.env.IOS_SIMULATOR_STARTUP_TIMEOUT ?? 300000),
    'appium:wdaLaunchTimeout': Number(process.env.IOS_WDA_LAUNCH_TIMEOUT ?? 300000),
    'appium:wdaConnectionTimeout': Number(process.env.IOS_WDA_CONNECTION_TIMEOUT ?? 300000)
};
