export type FailureCategory =
    | 'locator_issue'
    | 'synchronization_issue'
    | 'interaction_issue'
    | 'context_issue'
    | 'environment_issue'
    | 'data_issue'
    | 'app_bug'
    | 'framework_issue'
    | 'unknown';

export type FailureOwnership = 'qa_automation' | 'app_team' | 'backend_team' | 'infra' | 'unknown';

export type AnalysisSource = 'ai' | 'fallback' | 'skipped';

export type FailureArtifactFiles = {
    screenshot?: string;
    xmlSource?: string;
};

export type FailureExecutionContext = {
    platform?: string;
    appType?: 'native' | 'mobile_web' | 'hybrid' | 'unknown';
    currentContext?: string;
    availableContexts?: string[];
    sessionId?: string;
    testEnv?: string;
    specFile?: string;
    suite?: string;
    retryCount?: number;
    durationMs?: number;
};

export type FailureArtifactManifest = {
    test: string;
    error: string;
    errorName?: string;
    stackTrace?: string;
    aiStatus: 'pending' | 'done' | 'error' | 'skipped';
    aiDiagnosis: string | null;
    aiAnalysis?: FailureAnalysisResult | null;
    aiCompletedAt?: string;
    timestamp: string;
    files: FailureArtifactFiles;
    device?: Record<string, unknown>;
    execution?: FailureExecutionContext;
};

export type FailureAnalysisInput = {
    testTitle: string;
    errorMessage: string;
    errorName?: string;
    stackTrace?: string;
    xmlSource?: string;
    screenshotBase64?: string;
    screenshotPath?: string;
    device?: Record<string, unknown>;
    execution?: FailureExecutionContext;
    extractedSignals?: FailureExtractedSignals;
};

export type FailureExtractedSignals = {
    failingLocator?: string;
    locatorStrategy?: string;
    suspiciousLocatorText?: string;
    stackLocation?: string;
    xmlContainsSuspiciousText?: boolean;
    xmlContainsExpectedProductName?: boolean;
    expectedProductName?: string;
    suspectedIssueHints: string[];
};

export type FailureAnalysisResult = {
    failureCategory: FailureCategory;
    probableRootCause: string;
    confidenceScore: number;
    evidence: string[];
    recommendedActions: string[];
    likelyOwnership: FailureOwnership;
    shortSummary: string;
    detailedSummary: string;
    isLikelyFlaky: boolean;
    isLikelyAutomationIssue: boolean;
    isLikelyProductBug: boolean;
    analysisSource: AnalysisSource;
};
