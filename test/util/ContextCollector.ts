import { driver } from '@wdio/globals';
import * as fs from 'fs';
import * as path from 'path';
import { FailureArtifactManifest, FailureExecutionContext } from './ai/failureAnalysis.types';

type CollectErrorContextOptions = {
    testTitle: string;
    errorMessage: string;
    errorName?: string;
    stackTrace?: string;
    specFile?: string;
    suite?: string;
    retryCount?: number;
    durationMs?: number;
};

class ContextCollector {
    private getReportDir(): string {
        return path.resolve(process.cwd(), process.env.ERROR_SHOTS_DIR ?? path.join('test', 'errorShots'));
    }

    constructor() {
        const reportDir = this.getReportDir();
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }
    }

    private async getExecutionContext(options: CollectErrorContextOptions): Promise<FailureExecutionContext> {
        let currentContext: string | undefined;
        let availableContexts: string[] | undefined;

        try {
            if (typeof driver.getContext === 'function') {
                const contextValue = await driver.getContext();
                currentContext = typeof contextValue === 'string'
                    ? contextValue
                    : JSON.stringify(contextValue);
            }
        } catch {
            currentContext = undefined;
        }

        try {
            if (typeof driver.getContexts === 'function') {
                const contexts = await driver.getContexts();
                availableContexts = Array.isArray(contexts)
                    ? contexts.map((context) => typeof context === 'string' ? context : JSON.stringify(context))
                    : undefined;
            }
        } catch {
            availableContexts = undefined;
        }

        const platform = process.env.PLATFORM ?? 'unknown';
        const appType = platform.includes('web')
            ? 'mobile_web'
            : availableContexts && availableContexts.length > 1
                ? 'hybrid'
                : 'native';

        return {
            platform,
            appType,
            currentContext,
            availableContexts,
            sessionId: driver.sessionId,
            testEnv: process.env.TEST_ENV ?? process.env.NODE_ENV ?? 'qa',
            specFile: options.specFile,
            suite: options.suite,
            retryCount: options.retryCount,
            durationMs: options.durationMs
        };
    }

    async collectErrorContext(options: CollectErrorContextOptions): Promise<FailureArtifactManifest> {
        console.log(`>>> [DEBUG]: Starting Context Collection for: ${options.testTitle}`);
        const reportDir = this.getReportDir();
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileNameBase = `${options.testTitle.replace(/\s+/g, '_')}_${timestamp}`;

        const screenshotPath = path.join(reportDir, `${fileNameBase}.png`);
        try {
            await driver.saveScreenshot(screenshotPath);
            console.log(`>>> [DEBUG]: Screenshot saved: ${screenshotPath}`);
        } catch (error) {
            console.error('>>> [DEBUG]: Failed to save screenshot:', error);
        }

        let xmlPath: string | undefined;
        try {
            const pageSource = await driver.getPageSource();
            xmlPath = path.join(reportDir, `${fileNameBase}.xml`);
            fs.writeFileSync(xmlPath, pageSource);
            console.log(`>>> [DEBUG]: XML saved: ${xmlPath}`);
        } catch (error) {
            console.error('>>> [DEBUG]: Failed to save XML source:', error);
        }

        const manifest: FailureArtifactManifest = {
            test: options.testTitle,
            error: options.errorMessage,
            errorName: options.errorName,
            stackTrace: options.stackTrace,
            aiStatus: 'pending',
            aiDiagnosis: null,
            aiAnalysis: null,
            timestamp,
            files: {
                screenshot: fs.existsSync(screenshotPath) ? screenshotPath : undefined,
                xmlSource: xmlPath
            },
            device: driver.capabilities as unknown as Record<string, unknown>,
            execution: await this.getExecutionContext(options)
        };

        const manifestPath = path.join(reportDir, `${fileNameBase}_manifest.json`);
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        console.log(`>>> [DEBUG]: Manifest saved for post-run AI analysis: ${manifestPath}`);
        return manifest;
    }
}

export default new ContextCollector();
