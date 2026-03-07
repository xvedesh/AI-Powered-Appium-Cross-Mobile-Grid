const androidAppPath = process.env.ANDROID_APP_PATH ?? process.env.APP_PATH;

if (!androidAppPath) {
    throw new Error(
        'ANDROID_APP_PATH (or APP_PATH) is required for android-native. Example: ANDROID_APP_PATH="/Users/user/apps/mda-2.2.0-25.apk"'
    );
}

export const androidNativeCaps: WebdriverIO.Capabilities = {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': process.env.ANDROID_DEVICE_NAME ?? 'Pixel 7 Pro',
    'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION ?? '13',
    'appium:app': androidAppPath,
    'appium:udid': process.env.ANDROID_UDID,
    'appium:noReset': (process.env.ANDROID_NO_RESET ?? 'false') === 'true',
    'appium:newCommandTimeout': Number(process.env.NEW_COMMAND_TIMEOUT ?? 3600),
    ...(process.env.ANDROID_APP_PACKAGE ? { 'appium:appPackage': process.env.ANDROID_APP_PACKAGE } : {}),
    ...(process.env.ANDROID_APP_ACTIVITY ? { 'appium:appActivity': process.env.ANDROID_APP_ACTIVITY } : {})
};
