import 'dotenv/config';
import { createWdioConfig } from './wdio.base.conf';
import { resolvePlatform } from './test/config/server.provider';

const platform = resolvePlatform();
const resolveCapabilities = (): WebdriverIO.Capabilities => {
    if (platform === 'ios-native') {
        const { iosNativeCaps } = require('./test/config/caps/ios.native.caps');
        return iosNativeCaps;
    }
    if (platform === 'android-native') {
        const { androidNativeCaps } = require('./test/config/caps/android.native.caps');
        return androidNativeCaps;
    }
    if (platform === 'ios-web') {
        const { iosWebCaps } = require('./test/config/caps/ios.web.caps');
        return iosWebCaps;
    }

    const { androidWebCaps } = require('./test/config/caps/android.web.caps');
    return androidWebCaps;
};

export const config: WebdriverIO.Config = createWdioConfig({
    platform,
    capabilities: [resolveCapabilities()]
});
