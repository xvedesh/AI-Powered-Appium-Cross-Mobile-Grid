import { createWdioConfig } from './wdio.base.conf';
import { iosWebCaps } from './test/config/caps/ios.web.caps';

export const config: WebdriverIO.Config = createWdioConfig({
    platform: 'ios-web',
    capabilities: [iosWebCaps]
});
