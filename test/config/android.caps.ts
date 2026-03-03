const androidAppPath = process.env.ANDROID_APP_PATH ?? process.env.APP_PATH;

if (!androidAppPath) {
    throw new Error(
        'ANDROID_APP_PATH or APP_PATH is required. Example: PLATFORM=android APP_PATH=./apps/mda-2.2.0-25.apk npm test'
    );
}

export const androidCaps: WebdriverIO.Capabilities = {
    platformName: 'Android',
    'appium:deviceName': process.env.ANDROID_DEVICE_NAME ?? process.env.DEVICE_NAME ?? 'Android Emulator',
    'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION ?? process.env.PLATFORM_VERSION ?? '11',
    'appium:automationName': 'UiAutomator2',
    'appium:appPackage': process.env.ANDROID_APP_PACKAGE ?? 'io.appium.android.apis',
    'appium:appActivity': process.env.ANDROID_APP_ACTIVITY ?? '.ApiDemos',
    'appium:app': androidAppPath,
    'appium:udid': process.env.ANDROID_UDID,
    'appium:newCommandTimeout': Number(process.env.NEW_COMMAND_TIMEOUT ?? 240),
};
