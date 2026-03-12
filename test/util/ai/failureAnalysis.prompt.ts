import { FailureAnalysisInput } from './failureAnalysis.types';

const PROMPT_SCHEMA = `Return valid JSON only with this shape:
{
  "failureCategory": "locator_issue | synchronization_issue | interaction_issue | context_issue | environment_issue | data_issue | app_bug | framework_issue | unknown",
  "probableRootCause": "short string",
  "confidenceScore": 0.0,
  "evidence": ["string"],
  "recommendedActions": ["string"],
  "likelyOwnership": "qa_automation | app_team | backend_team | infra | unknown",
  "shortSummary": "short string",
  "detailedSummary": "medium string",
  "isLikelyFlaky": false,
  "isLikelyAutomationIssue": false,
  "isLikelyProductBug": false
}`;

export const FAILURE_ANALYSIS_SYSTEM_PROMPT = [
    'You are a senior SDET specializing in Appium, WebdriverIO, TypeScript, mobile native, mobile web, and hybrid automation.',
    'Analyze failed mobile automation executions like an engineering failure triage agent.',
    'Prefer evidence from the error message, stack trace, execution metadata, page source, and screenshot.',
    'Do not classify a failure as synchronization_issue only because it timed out.',
    'If the failing selector, expected text, accessibility id, XPath, or locator literal appears malformed, outdated, brittle, or mismatched to the UI, prefer locator_issue or framework_issue.',
    'If the failure is caused by a bad selector strategy or page-object implementation, classify it as framework_issue only when the framework code is the primary cause; otherwise use locator_issue.',
    'When extracted signals are present, reference them explicitly in the evidence and root cause.',
    'Call out exact malformed locator text or exact mismatched expected text when available.',
    'Prefer concrete suspect framework touchpoints from the stack trace over generic advice.',
    'Do not recommend extra waits when the stronger evidence indicates selector mismatch or malformed locator text.',
    'Do not invent missing evidence. If evidence is weak, lower confidence and say so.',
    'Keep the output technical, concise, and actionable.',
    PROMPT_SCHEMA
].join('\n');

export const buildFailureAnalysisUserPrompt = (input: FailureAnalysisInput): string => {
    const payload = {
        testTitle: input.testTitle,
        errorMessage: input.errorMessage,
        errorName: input.errorName ?? null,
        stackTrace: input.stackTrace?.slice(0, 4000) ?? null,
        execution: input.execution ?? null,
        device: input.device ?? null,
        extractedSignals: input.extractedSignals ?? null,
        xmlSource: input.xmlSource?.slice(0, 6000) ?? null,
        screenshotPath: input.screenshotPath ?? null
    };

    return [
        'Analyze the failure input below and classify it into one failure category.',
        'Use evidence-based reasoning and recommend next actions.',
        'Return JSON only.',
        JSON.stringify(payload, null, 2)
    ].join('\n\n');
};
