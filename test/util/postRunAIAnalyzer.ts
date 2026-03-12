import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import FailureAnalysisAgent from './ai/FailureAnalysisAgent';
import { FailureArtifactManifest, FailureAnalysisResult } from './ai/failureAnalysis.types';
import { formatFailureAnalysisText } from './ai/failureAnalysis.utils';

type PostRunAnalysisResult = {
    processed: number;
    readyMessage: string;
};

type AllureResultRecord = {
    name?: string;
    fullName?: string;
    status?: string;
    stop?: number;
    labels?: Array<{ name?: string; value?: string }>;
    steps?: Array<Record<string, unknown>>;
};

const reportDir = path.resolve(process.cwd(), process.env.ERROR_SHOTS_DIR ?? path.join('test', 'errorShots'));
const postRunLogPath = path.join(reportDir, 'post-run-ai.log');
const allureDir = path.resolve(process.cwd(), process.env.ALLURE_RESULTS_DIR ?? 'allure-results');
const allureReportDir = path.resolve(process.cwd(), process.env.ALLURE_REPORT_DIR ?? 'allure-report');

const appendLog = (message: string): void => {
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }

    const line = `[${new Date().toISOString()}] ${message}\n`;
    fs.appendFileSync(postRunLogPath, line);
};

const manifestTimestampToMs = (timestamp: string): number => {
    const parsed = Date.parse(timestamp);
    return Number.isNaN(parsed) ? 0 : parsed;
};

const getLabelValue = (result: AllureResultRecord, labelName: string): string | undefined =>
    result.labels?.find((label) => label.name === labelName)?.value;

const selectBestAllureResult = (
    manifest: FailureArtifactManifest,
    candidates: Array<{ filePath: string; result: AllureResultRecord }>
): { filePath: string; result: AllureResultRecord } | null => {
    const manifestTs = manifestTimestampToMs(manifest.timestamp);
    const specFileName = manifest.execution?.specFile ? path.basename(manifest.execution.specFile) : undefined;

    const scored = candidates.map((candidate) => {
        let score = 0;
        const packageLabel = getLabelValue(candidate.result, 'package') ?? '';
        const parentSuite = getLabelValue(candidate.result, 'parentSuite');

        if (candidate.result.name === manifest.test) {
            score += 100;
        }
        if (manifest.execution?.suite && parentSuite === manifest.execution.suite) {
            score += 25;
        }
        if (specFileName && packageLabel.endsWith(specFileName)) {
            score += 25;
        }
        if (candidate.result.status === 'failed' || candidate.result.status === 'broken') {
            score += 50;
        }

        const stop = Number(candidate.result.stop ?? 0);
        const distance = stop > 0 && manifestTs > 0 ? Math.abs(stop - manifestTs) : Number.MAX_SAFE_INTEGER;
        return { ...candidate, score, distance };
    });

    scored.sort((left, right) => {
        if (right.score !== left.score) {
            return right.score - left.score;
        }
        return left.distance - right.distance;
    });

    return scored[0] ?? null;
};

const persistAnalysisArtifacts = (manifest: FailureArtifactManifest, analysis: FailureAnalysisResult): void => {
    const manifestBasePath = manifest.files?.xmlSource?.replace(/\.xml$/, '')
        ?? manifest.files?.screenshot?.replace(/\.png$/, '')
        ?? path.join(reportDir, manifest.test.replace(/\s+/g, '_'));

    fs.writeFileSync(`${manifestBasePath}_analysis.txt`, formatFailureAnalysisText(analysis));
    fs.writeFileSync(`${manifestBasePath}_analysis.json`, JSON.stringify(analysis, null, 2));
};

const printConsoleSummary = (manifest: FailureArtifactManifest, analysis: FailureAnalysisResult): void => {
    console.log(`>>> [POST-RUN AI]: ${manifest.test}`);
    console.log(
        `>>> [POST-RUN AI]: ${analysis.failureCategory} | confidence=${analysis.confidenceScore.toFixed(2)} | owner=${analysis.likelyOwnership}`
    );
    console.log(`>>> [POST-RUN AI]: ${analysis.probableRootCause}`);
    if (analysis.recommendedActions[0]) {
        console.log(`>>> [POST-RUN AI]: Next action: ${analysis.recommendedActions[0]}`);
    }
};

const injectFailureAnalysisToAllure = (manifest: FailureArtifactManifest, analysis: FailureAnalysisResult): boolean => {
    if (!fs.existsSync(allureDir)) {
        return false;
    }

    const resultFiles = fs
        .readdirSync(allureDir)
        .filter((name) => name.endsWith('-result.json'))
        .map((name) => path.join(allureDir, name));

    const candidates: Array<{ filePath: string; result: AllureResultRecord }> = [];

    for (const filePath of resultFiles) {
        let json: AllureResultRecord;
        try {
            json = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as AllureResultRecord;
        } catch {
            continue;
        }

        if (json.name === manifest.test) {
            candidates.push({ filePath, result: json });
        }
    }

    const target = selectBestAllureResult(manifest, candidates);
    if (!target) {
        return false;
    }

    const textAttachmentSource = `${crypto.randomUUID()}-failure-analysis.txt`;
    const jsonAttachmentSource = `${crypto.randomUUID()}-failure-analysis.json`;

    fs.writeFileSync(path.join(allureDir, textAttachmentSource), formatFailureAnalysisText(analysis));
    fs.writeFileSync(path.join(allureDir, jsonAttachmentSource), JSON.stringify(analysis, null, 2));

    const resultWithSteps = target.result;
    resultWithSteps.steps = resultWithSteps.steps ?? [];
    resultWithSteps.steps = resultWithSteps.steps.filter((step) => step.name !== 'AI Failure Analysis Agent (Post-Run)');
    resultWithSteps.steps.push({
        name: 'AI Failure Analysis Agent (Post-Run)',
        status: 'passed',
        stage: 'finished',
        start: Date.now(),
        stop: Date.now(),
        attachments: [
            {
                name: 'AI Failure Analysis Summary',
                source: textAttachmentSource,
                type: 'text/plain'
            },
            {
                name: 'AI Failure Analysis JSON',
                source: jsonAttachmentSource,
                type: 'application/json'
            }
        ]
    });

    fs.writeFileSync(target.filePath, JSON.stringify(target.result));
    return true;
};

const loadManifest = (manifestPath: string): FailureArtifactManifest | null => {
    try {
        return JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as FailureArtifactManifest;
    } catch {
        return null;
    }
};

const analyzeManifest = async (manifest: FailureArtifactManifest): Promise<FailureArtifactManifest> => {
    const analysis = await FailureAnalysisAgent.analyzeManifest(manifest);
    const diagnosisText = formatFailureAnalysisText(analysis);

    return {
        ...manifest,
        aiStatus: analysis.analysisSource === 'skipped' ? 'skipped' : 'done',
        aiDiagnosis: diagnosisText,
        aiAnalysis: analysis,
        aiCompletedAt: new Date().toISOString()
    };
};

export const runPostRunAIAnalysis = async (): Promise<PostRunAnalysisResult> => {
    if (!fs.existsSync(reportDir)) {
        return {
            processed: 0,
            readyMessage: `No report directory found at ${reportDir}.`
        };
    }

    appendLog('Post-run AI failure analysis started.');
    const manifestFiles = fs.readdirSync(reportDir).filter((name) => name.endsWith('_manifest.json'));
    let processed = 0;

    for (const fileName of manifestFiles) {
        const manifestPath = path.join(reportDir, fileName);
        const manifest = loadManifest(manifestPath);
        if (!manifest) {
            continue;
        }

        if (manifest.aiStatus === 'done' && manifest.aiAnalysis) {
            continue;
        }

        const updatedManifest = await analyzeManifest(manifest);
        fs.writeFileSync(manifestPath, JSON.stringify(updatedManifest, null, 2));
        if (updatedManifest.aiAnalysis) {
            persistAnalysisArtifacts(updatedManifest, updatedManifest.aiAnalysis);
            printConsoleSummary(updatedManifest, updatedManifest.aiAnalysis);
        }

        const injected = updatedManifest.aiAnalysis
            ? injectFailureAnalysisToAllure(updatedManifest, updatedManifest.aiAnalysis)
            : false;

        appendLog(
            injected
                ? `AI failure analysis added to Allure for "${updatedManifest.test}".`
                : `AI failure analysis saved, but no matching Allure result was found for "${updatedManifest.test}".`
        );

        processed += 1;
    }

    if (processed === 0) {
        appendLog('No pending manifests found. Nothing to analyze.');
        return {
            processed: 0,
            readyMessage: `No pending manifests found in ${reportDir}.`
        };
    }

    const readyMessage =
        `Report is ready to generate, execute 'npx allure generate "${allureDir}" --clean -o "${allureReportDir}"' and then 'npx allure open "${allureReportDir}"'.`;
    appendLog(`Updated ${processed} manifest(s) in ${reportDir}.`);
    appendLog(readyMessage);
    console.log(`>>> [POST-RUN AI]: ${readyMessage}`);

    return { processed, readyMessage };
};
