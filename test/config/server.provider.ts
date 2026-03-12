export type PlatformTarget = 'ios-native' | 'android-native' | 'ios-web' | 'android-web';

const VALID_PLATFORMS: PlatformTarget[] = ['ios-native', 'android-native', 'ios-web', 'android-web'];

export const resolvePlatform = (input = process.env.DEFAULT_PLATFORM ?? process.env.PLATFORM): PlatformTarget => {
    const raw = (input ?? 'android-native').toLowerCase();

    if (raw === 'ios') return 'ios-native';
    if (raw === 'android') return 'android-native';
    if (VALID_PLATFORMS.includes(raw as PlatformTarget)) return raw as PlatformTarget;

    throw new Error(
        `Unsupported platform default "${raw}". Use one of: ios, android, ${VALID_PLATFORMS.join(', ')}`
    );
};

export const resolveAppiumServer = (platform: PlatformTarget): string => {
    if (platform.startsWith('ios')) {
        return process.env.IOS_APPIUM_SERVER ?? process.env.APPIUM_SERVER ?? 'http://127.0.0.1:4723';
    }

    return process.env.ANDROID_APPIUM_SERVER ?? process.env.APPIUM_SERVER ?? 'http://127.0.0.1:4723';
};

type ParseServerOptions = {
    defaultPath?: string;
};

export const parseServerUrl = (serverUrl: string, options?: ParseServerOptions) => {
    const parsed = new URL(serverUrl);
    const defaultPort = parsed.protocol === 'https:' ? 443 : 4723;
    const requestedPath = parsed.pathname && parsed.pathname !== '/' ? parsed.pathname : '';
    const fallbackPath = options?.defaultPath ?? '/';
    const normalizedPath = requestedPath || fallbackPath;

    return {
        hostname: parsed.hostname,
        port: Number(parsed.port || defaultPort),
        path: normalizedPath,
        href: parsed.toString()
    };
};
