export const androidWebCaps: WebdriverIO.Capabilities = {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    browserName: 'Chrome',
    'appium:deviceName': process.env.ANDROID_DEVICE_NAME ?? 'Samsung S23',
    'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION ?? '11',
    'appium:udid': process.env.ANDROID_UDID,
    'appium:noReset': (process.env.ANDROID_NO_RESET ?? 'false') === 'true',
    'appium:newCommandTimeout': Number(process.env.NEW_COMMAND_TIMEOUT ?? 3600),
    'appium:chromedriverAutodownload': (process.env.ANDROID_CHROMEDRIVER_AUTODOWNLOAD ?? 'true') === 'true'
};
