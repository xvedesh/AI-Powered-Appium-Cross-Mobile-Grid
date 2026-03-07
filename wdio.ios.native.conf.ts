import { createWdioConfig } from './wdio.base.conf';
import { iosNativeCaps } from './test/config/caps/ios.native.caps';

export const config: WebdriverIO.Config = createWdioConfig({
    platform: 'ios-native',
    capabilities: [iosNativeCaps]
});
