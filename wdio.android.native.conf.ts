import { createWdioConfig } from './wdio.base.conf';
import { androidNativeCaps } from './test/config/caps/android.native.caps';

export const config: WebdriverIO.Config = createWdioConfig({
    platform: 'android-native',
    capabilities: [androidNativeCaps]
});
