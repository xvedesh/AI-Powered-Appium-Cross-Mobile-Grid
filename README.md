# AppiumSauceDemo (WDIO v9 + TypeScript)

Cross-platform sandbox for 4 targets:
- `ios-native` (XCUITest)
- `android-native` (UiAutomator2)
- `ios-web` (mobile Safari)
- `android-web` (mobile Chrome)

## Run Matrix

Primary scripts:

```bash
npm run test:ios:native
npm run test:android:native
npm run test:ios:web
npm run test:android:web
```

Fresh variants (clean reports first):

```bash
npm run test:ios:native:fresh
npm run test:android:native:fresh
npm run test:ios:web:fresh
npm run test:android:web:fresh
```

Backward-compatible aliases still exist:
- `npm run test:ios` -> `test:ios:native`
- `npm run test:android` -> `test:android:native`

## Environment Variables

Core:

```env
TEST_ENV=qa
# PLATFORM is optional for entry configs, but used by legacy wdio.conf.ts
PLATFORM=ios-native

# Preferred single server URL
APPIUM_SERVER=http://192.168.0.32:4723

# Legacy fallbacks (still supported)
IOS_APPIUM_SERVER=http://192.168.0.32:4723
ANDROID_APPIUM_SERVER=http://192.168.0.32:4725/wd/hub
```

Native app paths (required only for native targets):

```env
IOS_APP_PATH="/Users/user/apps/My Demo App.app"
ANDROID_APP_PATH="/Users/user/apps/mda-2.2.0-25.apk"
```

Common optional vars:

```env
IOS_DEVICE_NAME="iPhone 14 Pro Max"
IOS_PLATFORM_VERSION=16.2
ANDROID_DEVICE_NAME="Samsung S23"
ANDROID_PLATFORM_VERSION=11
POST_RUN_AI=false
```

## Remote Appium Base Path (`/wd/hub`)

WDIO now parses full Appium URL and uses `hostname/port/path` correctly.
This fixes Android errors like `requested resource not found` when Appium is hosted with `/wd/hub`.

Examples:

- `APPIUM_SERVER=http://192.168.0.32:4725`
  - hostname: `192.168.0.32`
  - port: `4725`
  - path: `/`

- `APPIUM_SERVER=http://192.168.0.32:4725/wd/hub`
  - hostname: `192.168.0.32`
  - port: `4725`
  - path: `/wd/hub`

## TEST_ENV Switching

Env provider reads `TEST_ENV` (fallback: `NODE_ENV`, default: `qa`).

```bash
TEST_ENV=qa npm run test:ios:web
TEST_ENV=stage npm run test:ios:web
```

Dummy env configs:
- `test/config/envs/qa.ts`
- `test/config/envs/stage.ts`

## Remote Appium Prerequisites (Android host)

On the machine where Appium runs for Android:
- Android SDK installed
- `ANDROID_HOME` or `ANDROID_SDK_ROOT` exported
- `adb` available in PATH
- UiAutomator2 driver installed in Appium
- Device/emulator online (`adb devices`)

## Remote Appium Host Notes

For both Android and iOS remote execution:
- The remote Appium host must contain the required platform tooling.
- The test runner machine only sends WebDriver requests to the remote Appium server.
- If Appium is restarted from another shell, terminal tab, login session, or service, it may lose access to environment variables or tooling configuration unless that context is configured too.

## Android Appium Remote Setup

These Android SDK requirements must be configured on the machine where Appium runs, not just on the test runner machine.

### Android setup order on the Appium host

1. Add Android SDK environment variables to `~/.zshrc`

Required environment variables:
- `ANDROID_HOME`
- `ANDROID_SDK_ROOT`

Recommended `~/.zshrc` entries:

```bash
export ANDROID_SDK_ROOT="$HOME/Library/Android/sdk"
export ANDROID_HOME="$ANDROID_SDK_ROOT"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
```

2. Reload the shell

```bash
source ~/.zshrc
```

3. Verify the Android SDK environment in the same shell

```bash
echo $ANDROID_HOME
echo $ANDROID_SDK_ROOT
which adb
adb version
adb devices
$ANDROID_HOME/emulator/emulator -list-avds
```

4. If the emulator is not running, start it

First, list available AVDs:

```bash
$HOME/Library/Android/sdk/emulator/emulator -list-avds
```

Then start the required AVD:

```bash
$HOME/Library/Android/sdk/emulator/emulator -avd <AVD_NAME>
```

Example:

```bash
$HOME/Library/Android/sdk/emulator/emulator -avd Pixel_7_Pro_API_33
```

If the SDK paths are already available in `PATH`, the shorter form also works:

```bash
emulator -avd <YOUR_AVD_NAME>
```

5. Confirm the emulator or device is visible in `adb`

Expected `adb devices` output should include a connected emulator or device, for example:

```text
List of devices attached
emulator-5554	device
```

`adb devices` must show a connected emulator or physical device before running Android tests.

6. Start Appium from the same shell session

```bash
appium -p 4725 --base-path /wd/hub
```

Appium must be started in the same shell session where these Android SDK variables are loaded, unless your service or daemon configuration already defines them.

7. Check Appium status

```bash
curl http://127.0.0.1:4725/wd/hub/status
```

## iOS Appium Remote Setup

iOS automation requirements must be configured on the machine where Appium runs.

iOS automation requires macOS with Xcode installed.

Required tools on the Appium host:
- Xcode
- Xcode Command Line Tools
- Appium
- `appium-xcuitest-driver`
- iOS Simulator

### iOS setup order on the Appium host

1. Verify Xcode and Simulator tooling

```bash
xcodebuild -version
xcrun simctl list devices
```

2. Configure the active Xcode path

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
xcode-select -p
```

3. Accept the Xcode license and ensure command line tools are available

```bash
sudo xcodebuild -license accept
xcode-select --install
```

4. Verify Appium drivers

```bash
appium driver list --installed
appium driver install xcuitest
```

5. Boot the simulator

```bash
xcrun simctl boot "iPhone 14 Pro Max"
open -a Simulator
xcrun simctl list devices | grep Booted
```

6. Start the iOS Appium server on the Appium host

```bash
appium -p 4723 --base-path /wd/hub
```

7. Check Appium status

```bash
curl http://127.0.0.1:4723/wd/hub/status
```

Additional note:
- If Appium is started as a background service or daemon, verify it is using the correct macOS user account, Xcode selection, and signing/toolchain context.

## Remote Test Runner Examples

Run these from the test runner machine after the remote Appium host is ready:

```bash
npm run test:android:native:fresh
npm run test:ios:native:fresh
```

## Config Layout

- Shared config: `wdio.base.conf.ts`
- Entry configs:
  - `wdio.ios.native.conf.ts`
  - `wdio.android.native.conf.ts`
  - `wdio.ios.web.conf.ts`
  - `wdio.android.web.conf.ts`
- Caps:
  - `test/config/caps/ios.native.caps.ts`
  - `test/config/caps/android.native.caps.ts`
  - `test/config/caps/ios.web.caps.ts`
  - `test/config/caps/android.web.caps.ts`

## Notes

- Keep secrets out of repo (`.env` should stay local).
- `POST_RUN_AI=true` enables post-run analyzer. Default is disabled to avoid CI-side background process issues.
- Keep `PageFactory` pattern; it now routes mobile-web targets to `test/pageobjects/web/*` using `browserName` detection.
