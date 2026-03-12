import OpenAI from 'openai';
import * as fs from 'fs';
import AIService, { AIChatMessage } from '../AIService';
import { buildFailureAnalysisUserPrompt, FAILURE_ANALYSIS_SYSTEM_PROMPT } from './failureAnalysis.prompt';
import { FailureAnalysisInput, FailureAnalysisResult, FailureArtifactManifest } from './failureAnalysis.types';
import { buildFallbackFailureAnalysis, parseFailureAnalysisResponse } from './failureAnalysis.utils';
import { extractFailureSignals } from './failureSignalExtractor';

const readFileIfPresent = (filePath?: string, encoding: BufferEncoding = 'utf-8'): string | undefined => {
    if (!filePath || !fs.existsSync(filePath)) {
        return undefined;
    }

    return fs.readFileSync(filePath, encoding);
};

class FailureAnalysisAgent {
    private buildMessages(input: FailureAnalysisInput): AIChatMessage[] {
        const userContent: OpenAI.Chat.ChatCompletionContentPart[] = [
            {
                type: 'text',
                text: buildFailureAnalysisUserPrompt(input)
            }
        ];

        if (input.screenshotBase64) {
            userContent.push({
                type: 'image_url',
                image_url: {
                    url: `data:image/png;base64,${input.screenshotBase64}`,
                    detail: 'low'
                }
            });
        }

        return [
            {
                role: 'system',
                content: FAILURE_ANALYSIS_SYSTEM_PROMPT
            },
            {
                role: 'user',
                content: userContent
            }
        ];
    }

    createInputFromManifest(manifest: FailureArtifactManifest): FailureAnalysisInput {
        const input: FailureAnalysisInput = {
            testTitle: manifest.test,
            errorMessage: manifest.error,
            errorName: manifest.errorName,
            stackTrace: manifest.stackTrace,
            xmlSource: readFileIfPresent(manifest.files?.xmlSource),
            screenshotBase64: readFileIfPresent(manifest.files?.screenshot, 'base64'),
            screenshotPath: manifest.files?.screenshot,
            device: manifest.device,
            execution: manifest.execution
        };

        return {
            ...input,
            extractedSignals: extractFailureSignals(input)
        };
    }

    async analyze(input: FailureAnalysisInput): Promise<FailureAnalysisResult> {
        if (!AIService.isEnabled()) {
            return {
                ...buildFallbackFailureAnalysis(input, 'AI analysis skipped because OPENAI_API_KEY is not set.'),
                analysisSource: 'skipped'
            };
        }

        try {
            const rawResponse = await AIService.createChatCompletion({
                messages: this.buildMessages(input),
                maxTokens: 900
            });
            const parsed = parseFailureAnalysisResponse(rawResponse);

            if (parsed) {
                return parsed;
            }

            return buildFallbackFailureAnalysis(input, 'AI response could not be parsed into the required JSON schema.');
        } catch (error) {
            return buildFallbackFailureAnalysis(input, `AI request failed: ${(error as Error).message}`);
        }
    }

    async analyzeManifest(manifest: FailureArtifactManifest): Promise<FailureAnalysisResult> {
        const input = this.createInputFromManifest(manifest);
        return this.analyze(input);
    }
}

export default new FailureAnalysisAgent();
