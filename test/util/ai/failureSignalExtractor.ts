import { FailureAnalysisInput, FailureExtractedSignals } from './failureAnalysis.types';

const PRODUCT_TEXT_PATTERN = /Sauce Labs Backpack \(([^)]+)\)/i;

const extractFailingLocator = (errorMessage: string): string | undefined => {
    const match = errorMessage.match(/element \("([\s\S]*?)"\)/i);
    return match?.[1];
};

const extractLocatorStrategy = (locator?: string): string | undefined => {
    if (!locator) {
        return undefined;
    }
    if (locator.startsWith('//') || locator.startsWith('(')) {
        return 'xpath';
    }
    if (locator.startsWith('android=')) {
        return '-android uiautomator';
    }
    if (locator.startsWith('~')) {
        return 'accessibility id';
    }
    if (locator.startsWith('id=')) {
        return 'id';
    }
    return undefined;
};

const extractSuspiciousLocatorText = (locator?: string): string | undefined => {
    if (!locator) {
        return undefined;
    }

    const textAttrMatch = locator.match(/@text="([^"]+)"/i);
    if (textAttrMatch?.[1]) {
        return textAttrMatch[1];
    }

    const productTextMatch = locator.match(PRODUCT_TEXT_PATTERN);
    return productTextMatch?.[0];
};

const extractStackLocation = (stackTrace?: string): string | undefined => {
    if (!stackTrace) {
        return undefined;
    }

    const lines = stackTrace.split('\n').map((line) => line.trim());
    const relevant = lines.find((line) => line.includes('/test/') || line.includes('AndroidCatalogPage') || line.includes('Page.ts'));
    return relevant;
};

export const extractFailureSignals = (input: FailureAnalysisInput): FailureExtractedSignals => {
    const failingLocator = extractFailingLocator(input.errorMessage);
    const suspiciousLocatorText = extractSuspiciousLocatorText(failingLocator);
    const expectedProductName = input.testTitle.toLowerCase().includes('purchase one catalog item')
        ? 'Sauce Labs Backpack (yellow)'
        : undefined;
    const xmlSource = input.xmlSource ?? '';

    const suspectedIssueHints: string[] = [];

    if (failingLocator) {
        suspectedIssueHints.push('failing_locator_present');
    }
    if (suspiciousLocatorText) {
        suspectedIssueHints.push('locator_text_present');
    }
    if (suspiciousLocatorText && suspiciousLocatorText.includes('yell.,k')) {
        suspectedIssueHints.push('locator_text_malformed');
    }
    if (expectedProductName && suspiciousLocatorText && suspiciousLocatorText !== expectedProductName) {
        suspectedIssueHints.push('locator_text_mismatch');
    }
    if (failingLocator && /xpath|@text=|android\.view\.viewgroup/i.test(failingLocator)) {
        suspectedIssueHints.push('brittle_locator_strategy');
    }
    if ((input.stackTrace ?? '').includes('scrollAndClickItemByTitle')) {
        suspectedIssueHints.push('page_object_selector_builder');
    }

    return {
        failingLocator,
        locatorStrategy: extractLocatorStrategy(failingLocator),
        suspiciousLocatorText,
        stackLocation: extractStackLocation(input.stackTrace),
        xmlContainsSuspiciousText: suspiciousLocatorText ? xmlSource.includes(suspiciousLocatorText) : undefined,
        xmlContainsExpectedProductName: expectedProductName ? xmlSource.includes(expectedProductName) : undefined,
        expectedProductName,
        suspectedIssueHints
    };
};
