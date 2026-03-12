# AppiumSauceDemo

Mobile automation framework built with WebdriverIO v9, TypeScript, and Appium.

Supported targets:
- `ios-native` via XCUITest
- `android-native` via UiAutomator2
- `ios-web` via mobile Safari
- `android-web` via mobile Chrome

## Framework Overview

This framework is designed for one test suite to run across native mobile apps and mobile web with the same WebdriverIO + TypeScript foundation. It uses environment-aware configuration, platform-specific capabilities, and page objects to keep test code reusable while still handling iOS and Android differences where needed.

At a high level, the framework provides:
- cross-platform execution for iOS and Android
- support for both native app and mobile web flows
- page object based test design for maintainability
- Allure reporting for execution visibility
- an AI failure analysis agent that explains failed runs using captured artifacts

## AI Failure Analysis Agent

This project includes an AI agent for post-run failure diagnosis. Its job is not to generate tests or drive the device live during execution. Instead, it reviews failure artifacts after a test fails and adds a structured technical analysis to the run output and Allure report.

What the agent does:
- reads the failure message, stack trace, execution metadata, page source XML, and screenshot when available
- extracts useful failure signals such as suspicious locators, context issues, timeout patterns, and likely framework touchpoints
- classifies the failure into categories like `locator_issue`, `synchronization_issue`, `interaction_issue`, `context_issue`, `environment_issue`, `data_issue`, `app_bug`, or `framework_issue`
- returns a probable root cause, confidence score, likely ownership, evidence, and recommended next actions
- saves the analysis as text and JSON artifacts and injects it into the matching Allure result

Benefits of the agent:
- reduces manual triage time after failed runs
- gives a more consistent first diagnosis across teams
- helps separate automation problems from app, backend, or infrastructure issues
- makes Allure reports more useful because the failure explanation is attached directly to the test result
- supports demo and local debugging workflows without changing the actual test logic

## How the Agent Is Implemented

The implementation is a lightweight post-run analysis pipeline:

1. When a test fails, the framework stores failure artifacts such as the error details, screenshot, XML source, device data, and execution context in a manifest.
2. `test/util/postRunAIAnalyzer.ts` scans pending manifests after execution.
3. `test/util/ai/FailureAnalysisAgent.ts` builds the AI input from those artifacts and sends it through `test/util/AIService.ts`.
4. The OpenAI request uses a strict prompt that asks for JSON-only output with a fixed schema so the response can be parsed safely.
5. The analysis is normalized, saved as `_analysis.txt` and `_analysis.json`, and then attached to the matching Allure result entry.
6. If AI is disabled or the response cannot be parsed, the framework falls back to rule-based analysis so the report still contains a useful diagnosis.

## How It Works in Practice

The agent is enabled only when `OPENAI_API_KEY` is available. During a run, the tests execute normally. After the run, if `POST_RUN_AI=true`, the framework waits for failure analysis to complete before generating the report. This ensures the AI diagnosis is already written into `allure-results/<platform>` and shows up inside the final Allure report.

This design keeps the framework readable and predictable:
- test execution remains standard WebdriverIO + Appium
- AI is isolated to post-run diagnostics
- the suite still works without AI, because fallback logic is built in
- report generation stays compatible with normal Allure workflows

## Run Commands

Primary scripts:

```bash
npm run test:ios:native
npm run test:android:native
npm run test:ios:web
npm run test:android:web
```

Fresh runs:

```bash
npm run test:ios:native:fresh
npm run test:android:native:fresh
npm run test:ios:web:fresh
npm run test:android:web:fresh
```

Demo runs with automatic AI analysis, report generation, and report opening:

```bash
npm run test:ios:native:demo
npm run test:android:native:demo
npm run test:ios:web:demo
npm run test:android:web:demo
```

Parallel demo runs with one consolidated report opened at the end:

```bash
npm run test:native:parallel:demo
npm run test:web:parallel:demo
```

Single-spec execution:

```bash
npm run test:ios:native -- --spec ./test/specs/auth.spec.ts
npm run test:android:native -- --spec ./test/specs/purchaseOneItem.spec.ts
npm run test:ios:web -- --spec ./test/specs/auth.spec.ts
npm run test:android:web -- --spec ./test/specs/purchaseOneItem.spec.ts
```

Single-spec execution with fresh cleanup:

```bash
npm run test:ios:native:fresh -- --spec ./test/specs/auth.spec.ts
npm run test:android:native:fresh -- --spec ./test/specs/purchaseOneItem.spec.ts
npm run test:ios:web:fresh -- --spec ./test/specs/auth.spec.ts
npm run test:android:web:fresh -- --spec ./test/specs/purchaseOneItem.spec.ts
```

Backward-compatible aliases:
- `npm run test:ios` -> `test:ios:native`
- `npm run test:android` -> `test:android:native`

## Allure Reports

Single-platform report:

```bash
npx allure generate allure-results/ios-native --clean -o allure-report/ios-native
npx allure open allure-report/ios-native

npx allure generate allure-results/android-native --clean -o allure-report/android-native
npx allure open allure-report/android-native

npx allure generate allure-results/ios-web --clean -o allure-report/ios-web
npx allure open allure-report/ios-web

npx allure generate allure-results/android-web --clean -o allure-report/android-web
npx allure open allure-report/android-web
```

Single-platform temporary report:

```bash
npx allure serve allure-results/ios-native
npx allure serve allure-results/android-native
npx allure serve allure-results/ios-web
npx allure serve allure-results/android-web
```

Consolidated native report:

```bash
npm run test:ios:native:fresh & npm run test:android:native:fresh & wait
npx allure generate allure-results/ios-native allure-results/android-native --clean -o allure-report/consolidated
npx allure open allure-report/consolidated
```

Temporary consolidated native report:

```bash
npm run test:ios:native:fresh & npm run test:android:native:fresh & wait
npx allure serve allure-results/ios-native allure-results/android-native
```

Consolidated web report:

```bash
npm run test:ios:web:fresh & npm run test:android:web:fresh & wait
npx allure generate allure-results/ios-web allure-results/android-web --clean -o allure-report/consolidated
npx allure open allure-report/consolidated
```

Temporary consolidated web report:

```bash
npm run test:ios:web:fresh & npm run test:android:web:fresh & wait
npx allure serve allure-results/ios-web allure-results/android-web
```

## Environment Variables

Core:

```env
TEST_ENV=qa
DEFAULT_PLATFORM=android-native

# Preferred shared Appium server
APPIUM_SERVER=http://127.0.0.1:4723

# Optional per-platform overrides
IOS_APPIUM_SERVER=http://127.0.0.1:4723
ANDROID_APPIUM_SERVER=http://127.0.0.1:4725/wd/hub
```

Native app paths:

```env
IOS_APP_PATH="/absolute/path/My Demo App.app"
ANDROID_APP_PATH="/absolute/path/mda.apk"
```

Common optional variables:

```env
IOS_DEVICE_NAME="iPhone 14 Pro Max"
IOS_PLATFORM_VERSION=16.2
ANDROID_DEVICE_NAME="Pixel 7 Pro"
ANDROID_PLATFORM_VERSION=13
OPENAI_API_KEY="<your-api-key>"
OPENAI_FAILURE_ANALYSIS_MODEL="gpt-4o-mini"
POST_RUN_AI=true
AUTO_GENERATE_ALLURE_REPORT=true
AUTO_OPEN_ALLURE_REPORT=true
```

Notes:
- `DEFAULT_PLATFORM` is used by the generic `wdio.conf.ts` entrypoint.
- `PLATFORM` is resolved at runtime by the platform-specific configs.
- `TEST_ENV` falls back to `NODE_ENV` and defaults to `qa`.
- `OPENAI_API_KEY` enables the AI failure analysis agent.
- `OPENAI_FAILURE_ANALYSIS_MODEL` is optional and defaults to `gpt-4o-mini`.
- `POST_RUN_AI=true` waits for post-run AI analysis to finish so the diagnosis is written into `allure-results/<platform>` before report generation.
- `AUTO_GENERATE_ALLURE_REPORT=true` generates the platform report automatically at the end of the run.
- `AUTO_OPEN_ALLURE_REPORT=true` opens the generated platform report automatically after generation. This is intended for local demo use, not CI.
- For parallel showcase runs, prefer one consolidated `allure generate` + `allure open` command after both runs finish instead of auto-opening each platform report separately.

## Appium Server URL and Base Path

The framework supports both root-path and `/wd/hub` Appium URLs.

Examples:
- `APPIUM_SERVER=http://127.0.0.1:4723`
- `ANDROID_APPIUM_SERVER=http://127.0.0.1:4725/wd/hub`

The server URL is parsed into `hostname`, `port`, and `path`, which avoids Android routing issues when Appium is started with `--base-path /wd/hub`.

## TEST_ENV Switching

```bash
TEST_ENV=qa npm run test:ios:web
TEST_ENV=stage npm run test:ios:web
```

Available sample env configs:
- `test/config/envs/qa.ts`
- `test/config/envs/stage.ts`

## Android Setup

Configure these on the machine where Appium runs.

Requirements:
- Android SDK
- `ANDROID_HOME` or `ANDROID_SDK_ROOT`
- `adb` in `PATH`
- Appium with `uiautomator2`
- connected device or running emulator

Suggested shell configuration:

```bash
export ANDROID_SDK_ROOT="$HOME/Library/Android/sdk"
export ANDROID_HOME="$ANDROID_SDK_ROOT"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
```

Reload and verify:

```bash
source ~/.zshrc
echo $ANDROID_HOME
echo $ANDROID_SDK_ROOT
which adb
adb version
adb devices
$ANDROID_HOME/emulator/emulator -list-avds
```

Start an emulator if needed:

```bash
$HOME/Library/Android/sdk/emulator/emulator -avd <AVD_NAME>
```

Start Appium:

```bash
appium -p 4725 --base-path /wd/hub
```

Check status:

```bash
curl http://127.0.0.1:4725/wd/hub/status
```

## iOS Setup

Configure these on the machine where Appium runs.

Requirements:
- macOS
- Xcode
- Xcode Command Line Tools
- Appium with `xcuitest`
- iOS Simulator

Verify tooling:

```bash
xcodebuild -version
xcrun simctl list devices
appium driver list --installed
```

Configure Xcode:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
xcode-select -p
sudo xcodebuild -license accept
```

Install the Appium driver if needed:

```bash
appium driver install xcuitest
```

Boot the simulator:

```bash
xcrun simctl boot "iPhone 14 Pro Max"
open -a Simulator
xcrun simctl list devices | grep Booted
```

Start Appium:

```bash
appium -p 4723 --base-path /wd/hub
```

Check status:

```bash
curl http://127.0.0.1:4723/wd/hub/status
```

## Config Layout

- shared config: `wdio.base.conf.ts`
- platform entry configs:
  - `wdio.ios.native.conf.ts`
  - `wdio.android.native.conf.ts`
  - `wdio.ios.web.conf.ts`
  - `wdio.android.web.conf.ts`
- capability configs:
  - `test/config/caps/ios.native.caps.ts`
  - `test/config/caps/android.native.caps.ts`
  - `test/config/caps/ios.web.caps.ts`
  - `test/config/caps/android.web.caps.ts`

## Notes

- Keep secrets out of the repo.
- Keep `.env` local.
- The current framework is still under development; cloud execution documentation will be added later.
- `PageFactory` routes mobile web targets to `test/pageobjects/web/*` based on `browserName`.
