import { createWdioConfig } from './wdio.base.conf';
import { androidWebCaps } from './test/config/caps/android.web.caps';

export const config: WebdriverIO.Config = createWdioConfig({
    platform: 'android-web',
    capabilities: [androidWebCaps]
});
