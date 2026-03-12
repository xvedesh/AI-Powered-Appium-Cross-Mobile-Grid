import { FailureAnalysisInput, FailureAnalysisResult, FailureCategory, FailureOwnership } from './failureAnalysis.types';

const FAILURE_CATEGORIES: FailureCategory[] = [
    'locator_issue',
    'synchronization_issue',
    'interaction_issue',
    'context_issue',
    'environment_issue',
    'data_issue',
    'app_bug',
    'framework_issue',
    'unknown'
];

const FAILURE_OWNERS: FailureOwnership[] = ['qa_automation', 'app_team', 'backend_team', 'infra', 'unknown'];

const clampConfidence = (value: unknown): number => {
    const numeric = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(numeric)) {
        return 0.35;
    }
    return Math.min(1, Math.max(0, Number(numeric.toFixed(2))));
};

const ensureStringArray = (value: unknown, fallback: string[]): string[] => {
    if (!Array.isArray(value)) {
        return fallback;
    }

    const normalized = value
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean);

    return normalized.length > 0 ? normalized : fallback;
};

export const extractJsonObject = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }

    const directMatch = trimmed.match(/\{[\s\S]*\}/);
    return directMatch ? directMatch[0] : null;
};

export const parseFailureAnalysisResponse = (value: string): FailureAnalysisResult | null => {
    const jsonBlock = extractJsonObject(value);
    if (!jsonBlock) {
        return null;
    }

    let parsed: Record<string, unknown>;
    try {
        parsed = JSON.parse(jsonBlock) as Record<string, unknown>;
    } catch {
        return null;
    }

    const failureCategory = FAILURE_CATEGORIES.includes(parsed.failureCategory as FailureCategory)
        ? (parsed.failureCategory as FailureCategory)
        : 'unknown';
    const likelyOwnership = FAILURE_OWNERS.includes(parsed.likelyOwnership as FailureOwnership)
        ? (parsed.likelyOwnership as FailureOwnership)
        : 'unknown';

    return {
        failureCategory,
        probableRootCause: String(parsed.probableRootCause ?? 'Insufficient evidence to identify a likely root cause.'),
        confidenceScore: clampConfidence(parsed.confidenceScore),
        evidence: ensureStringArray(parsed.evidence, ['The model returned limited structured evidence.']),
        recommendedActions: ensureStringArray(parsed.recommendedActions, ['Review the captured error, page source, and screenshot manually.']),
        likelyOwnership,
        shortSummary: String(parsed.shortSummary ?? 'Failure analysis completed with limited structure.'),
        detailedSummary: String(parsed.detailedSummary ?? 'The AI response was partially structured and required normalization.'),
        isLikelyFlaky: Boolean(parsed.isLikelyFlaky),
        isLikelyAutomationIssue: Boolean(parsed.isLikelyAutomationIssue),
        isLikelyProductBug: Boolean(parsed.isLikelyProductBug),
        analysisSource: 'ai'
    };
};

const buildResult = (
    category: FailureCategory,
    rootCause: string,
    evidence: string[],
    recommendedActions: string[],
    ownership: FailureOwnership,
    confidence: number,
    overrides?: Partial<FailureAnalysisResult>
): FailureAnalysisResult => ({
    failureCategory: category,
    probableRootCause: rootCause,
    confidenceScore: clampConfidence(confidence),
    evidence,
    recommendedActions,
    likelyOwnership: ownership,
    shortSummary: overrides?.shortSummary ?? rootCause,
    detailedSummary: overrides?.detailedSummary ?? rootCause,
    isLikelyFlaky: overrides?.isLikelyFlaky ?? false,
    isLikelyAutomationIssue: overrides?.isLikelyAutomationIssue ?? ['locator_issue', 'synchronization_issue', 'interaction_issue', 'context_issue', 'framework_issue'].includes(category),
    isLikelyProductBug: overrides?.isLikelyProductBug ?? category === 'app_bug',
    analysisSource: overrides?.analysisSource ?? 'fallback'
});

export const buildFallbackFailureAnalysis = (
    input: FailureAnalysisInput,
    reason = 'AI response unavailable or malformed.'
): FailureAnalysisResult => {
    const errorMessage = (input.errorMessage ?? '').toLowerCase();
    const signals = input.extractedSignals;
    const haystack = [
        input.errorName,
        input.errorMessage,
        input.stackTrace,
        input.execution?.currentContext,
        input.execution?.availableContexts?.join(' '),
        input.xmlSource
    ]
        .filter((value): value is string => Boolean(value))
        .join('\n')
        .toLowerCase();

    if (signals?.suspectedIssueHints.includes('locator_text_malformed') || signals?.suspectedIssueHints.includes('locator_text_mismatch')) {
        const suspiciousText = signals.suspiciousLocatorText ?? 'unknown locator text';
        const expectedText = signals.expectedProductName;
        const stackLocation = signals.stackLocation ?? 'stack location unavailable';

        return buildResult(
            'locator_issue',
            expectedText
                ? `The failing locator uses "${suspiciousText}" instead of the expected text "${expectedText}".`
                : `The failing locator uses malformed or mismatched text: "${suspiciousText}".`,
            [
                signals.failingLocator ? `Failing locator: ${signals.failingLocator}` : 'The error includes an explicit failing locator.',
                expectedText ? `Expected product text: ${expectedText}` : 'Expected product text could not be confirmed.',
                `Stack location: ${stackLocation}`,
                reason
            ],
            [
                'Inspect the selector input used to build the locator.',
                'Verify the product name source before the selector is constructed.',
                'Check the page object selector builder and prefer stable IDs over text-dependent XPath when possible.'
            ],
            'qa_automation',
            0.95,
            {
                shortSummary: 'The locator text is malformed or mismatched to the expected product label.',
                detailedSummary: expectedText
                    ? `The failure is not a generic wait problem. The selector was built with "${suspiciousText}", while the expected product text is "${expectedText}". The most likely issue is in the test data or selector-construction path rather than the application under test.`
                    : `The failure is not a generic wait problem. The selector contains suspicious locator text "${suspiciousText}", which strongly suggests locator drift or malformed selector input in the automation layer.`,
                isLikelyFlaky: false
            }
        );
    }

    if (
        (
            /xpath|@text=|accessibility id|resource-id|uiselector|android\.view\.viewgroup/.test(errorMessage) ||
            /scrollandclickitembytitle|selector|locator/.test(haystack)
        ) &&
        /still not displayed|not displayed after|timed out|timeout/.test(haystack)
    ) {
        return buildResult(
            'locator_issue',
            'The failure most likely comes from a selector or expected-text mismatch rather than a pure timing issue.',
            [
                'The failing message includes a concrete locator or selector literal.',
                'The timeout occurred while waiting for an element resolved by that locator.',
                reason
            ],
            [
                'Validate the selector against the latest page source and screenshot.',
                'Check whether the expected product text or accessibility label is incorrect or malformed.',
                'Prefer stable resource IDs or accessibility IDs over brittle XPath text matching where possible.'
            ],
            'qa_automation',
            0.9,
            {
                shortSummary: 'Element selector did not resolve to the expected UI element.',
                detailedSummary: 'The failure timed out while waiting for an element addressed by a concrete locator. That pattern is more consistent with locator drift, malformed expected text, or a brittle selector strategy than with a generic synchronization problem.',
                isLikelyFlaky: false
            }
        );
    }

    if (/no such element|element could not be located|can't find element|unable to locate/.test(haystack)) {
        return buildResult(
            'locator_issue',
            'The failure most likely comes from an outdated or unstable locator.',
            ['The error text indicates the target element could not be found.', reason],
            ['Verify the selector against the latest page source.', 'Prefer stable accessibility IDs or resource IDs over brittle XPath where possible.'],
            'qa_automation',
            0.82
        );
    }

    if (/timeout|waituntil|still not displayed|not displayed after|element .* not visible|timed out/.test(haystack)) {
        return buildResult(
            'synchronization_issue',
            'The failure most likely comes from a missing or insufficient wait around a UI state change.',
            ['The error text points to a timeout or element readiness problem.', reason],
            ['Add or tighten an explicit wait around the expected UI condition.', 'Check for delayed rendering, animations, or navigation timing.'],
            'qa_automation',
            0.78,
            { isLikelyFlaky: true }
        );
    }

    if (/not clickable|click intercepted|another element would receive the click|element click intercepted|method is not implemented.*execute\/sync/.test(haystack)) {
        return buildResult(
            'interaction_issue',
            'The failure most likely comes from an interaction strategy that does not match the active mobile context.',
            ['The error indicates a clickability or interaction mismatch.', reason],
            ['Use native-safe visibility or enabled checks instead of web-only clickability checks.', 'Inspect whether the element is overlapped, offscreen, or handled in the wrong context.'],
            'qa_automation',
            0.84,
            { isLikelyFlaky: /intercepted|overlap/.test(haystack) }
        );
    }

    if (/webview|native_app|context|no such context|failed to switch/.test(haystack)) {
        return buildResult(
            'context_issue',
            'The failure most likely comes from an incorrect or missing context switch.',
            ['The failure includes context or WEBVIEW/NATIVE_APP signals.', reason],
            ['Confirm the expected context is available before interacting.', 'Add explicit context polling before switching in hybrid flows.'],
            'qa_automation',
            0.81
        );
    }

    if (/session not created|disconnected|socket hang up|econnrefused|uiautomator2|xctest|appium server|device .* disconnected|unable to discover open pages|invalid session id/.test(haystack)) {
        return buildResult(
            'environment_issue',
            'The failure most likely comes from infrastructure or device instability rather than the test logic.',
            ['The error includes Appium, session, connectivity, or device instability signals.', reason],
            ['Check Appium server health and device connectivity.', 'Review device logs and rerun to confirm whether the issue is reproducible.'],
            'infra',
            0.8,
            { isLikelyFlaky: true, isLikelyAutomationIssue: false }
        );
    }

    if (/invalid credentials|duplicate|already exists|not seeded|account|test data|404/.test(haystack)) {
        return buildResult(
            'data_issue',
            'The failure most likely comes from invalid or conflicting test data.',
            ['The error includes account, seed, or duplicate-data signals.', reason],
            ['Verify the data seed and account state used by the test.', 'Use isolated or freshly provisioned test data for reruns.'],
            'qa_automation',
            0.72
        );
    }

    if (/500|502|503|backend|api error|application crashed|fatal exception|nullpointerexception/.test(haystack)) {
        return buildResult(
            'app_bug',
            'The failure has signals consistent with a real application or backend defect.',
            ['The failure includes backend or crash-like signals.', reason],
            ['Check app and backend logs around the failure timestamp.', 'Validate whether the issue is reproducible outside the automation flow.'],
            /backend|api/.test(haystack) ? 'backend_team' : 'app_team',
            0.76,
            { isLikelyAutomationIssue: false, isLikelyProductBug: true }
        );
    }

    if (/typeerror|referenceerror|cannot read properties|undefined is not a function|framework|page object|selector builder|method is not implemented/.test(haystack)) {
        return buildResult(
            'framework_issue',
            'The failure most likely comes from the automation framework implementation rather than the application.',
            ['The error includes framework or code-level failure signals.', reason],
            ['Inspect the page object or helper method at the failure line.', 'Review recent framework changes affecting selectors, waits, or interactions.'],
            'qa_automation',
            0.79
        );
    }

    return buildResult(
        'unknown',
        'The available artifacts are insufficient to classify the failure confidently.',
        ['The current evidence is incomplete or ambiguous.', reason],
        ['Review the captured error, stack trace, page source, and screenshot manually.', 'Add richer failure metadata if this failure pattern repeats.'],
        'unknown',
        0.35,
        { isLikelyFlaky: false, isLikelyAutomationIssue: false, isLikelyProductBug: false }
    );
};

export const formatFailureAnalysisText = (result: FailureAnalysisResult): string => [
    `Failure Category: ${result.failureCategory}`,
    `Confidence: ${result.confidenceScore.toFixed(2)}`,
    `Likely Owner: ${result.likelyOwnership}`,
    `Flaky Risk: ${result.isLikelyFlaky ? 'high' : 'low'}`,
    `Automation Issue: ${result.isLikelyAutomationIssue ? 'yes' : 'no'}`,
    `Product Bug: ${result.isLikelyProductBug ? 'yes' : 'no'}`,
    '',
    `Short Summary`,
    result.shortSummary,
    '',
    `Probable Root Cause`,
    result.probableRootCause,
    '',
    `Evidence`,
    ...result.evidence.map((item) => `- ${item}`),
    '',
    `Recommended Actions`,
    ...result.recommendedActions.map((item) => `- ${item}`),
    '',
    `Detailed Summary`,
    result.detailedSummary
].join('\n');
