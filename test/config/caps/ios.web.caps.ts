export const iosWebCaps: WebdriverIO.Capabilities = {
    platformName: 'iOS',
    'appium:automationName': 'XCUITest',
    browserName: 'Safari',
    'appium:deviceName': process.env.IOS_DEVICE_NAME ?? 'iPhone 14 Pro Max',
    'appium:platformVersion': process.env.IOS_PLATFORM_VERSION ?? '16.2',
    'appium:udid': process.env.IOS_UDID,
    'appium:noReset': (process.env.IOS_NO_RESET ?? 'false') === 'true',
    'appium:newCommandTimeout': Number(process.env.NEW_COMMAND_TIMEOUT ?? 3600),
    'appium:includeSafariInWebviews': true,
    'appium:safariIgnoreFraudWarning': true
};
