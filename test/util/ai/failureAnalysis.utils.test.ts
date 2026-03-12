import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFallbackFailureAnalysis, parseFailureAnalysisResponse } from './failureAnalysis.utils';
import { extractFailureSignals } from './failureSignalExtractor';

test('parseFailureAnalysisResponse parses structured JSON payload', () => {
    const parsed = parseFailureAnalysisResponse(`{
        "failureCategory": "locator_issue",
        "probableRootCause": "Selector no longer matches the screen",
        "confidenceScore": 0.91,
        "evidence": ["No such element error"],
        "recommendedActions": ["Update the locator"],
        "likelyOwnership": "qa_automation",
        "shortSummary": "Locator drift",
        "detailedSummary": "The selector no longer matches the current UI hierarchy.",
        "isLikelyFlaky": false,
        "isLikelyAutomationIssue": true,
        "isLikelyProductBug": false
    }`);

    assert.ok(parsed);
    assert.equal(parsed?.failureCategory, 'locator_issue');
    assert.equal(parsed?.likelyOwnership, 'qa_automation');
    assert.equal(parsed?.confidenceScore, 0.91);
});

test('buildFallbackFailureAnalysis classifies timeout failures as synchronization issues', () => {
    const result = buildFallbackFailureAnalysis({
        testTitle: 'checkout test',
        errorMessage: 'element ("~loginBtn") still not displayed after 10000ms'
    });

    assert.equal(result.failureCategory, 'synchronization_issue');
    assert.equal(result.likelyOwnership, 'qa_automation');
    assert.equal(result.isLikelyFlaky, true);
});

test('buildFallbackFailureAnalysis handles missing artifacts without crashing', () => {
    const result = buildFallbackFailureAnalysis({
        testTitle: 'unknown failure',
        errorMessage: 'unexpected issue'
    });

    assert.equal(result.failureCategory, 'unknown');
    assert.ok(result.recommendedActions.length > 0);
});

test('buildFallbackFailureAnalysis treats locator-literal timeout failures as locator issues', () => {
    const input = {
        testTitle: 'user should be able to purchase one catalog item [android-native]',
        errorMessage:
            'element ("//android.view.ViewGroup[.//android.widget.TextView[@text=\\"Sauce Labs Backpack (yell.,k)\\"]]") still not displayed after 5000ms',
        stackTrace: 'Error: failed\n    at async AndroidCatalogPage.scrollAndClickItemByTitle (/Users/test/android.catalog.page.ts:30:9)'
    };
    const result = buildFallbackFailureAnalysis({
        ...input,
        extractedSignals: extractFailureSignals(input)
    });

    assert.equal(result.failureCategory, 'locator_issue');
    assert.equal(result.isLikelyFlaky, false);
    assert.equal(result.likelyOwnership, 'qa_automation');
    assert.match(result.probableRootCause, /yell\.,k/i);
    assert.match(result.probableRootCause, /yellow/i);
});
