import OpenAI from 'openai';
import * as fs from 'fs';

export type AIChatMessage = OpenAI.Chat.ChatCompletionMessageParam;

type ChatCompletionOptions = {
    messages: AIChatMessage[];
    model?: string;
    maxTokens?: number;
};

class AIService {
    private readonly openai: OpenAI | null;

    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        this.openai = apiKey ? new OpenAI({ apiKey }) : null;
    }

    isEnabled(): boolean {
        return this.openai !== null;
    }

    async createChatCompletion(options: ChatCompletionOptions): Promise<string> {
        if (!this.openai) {
            throw new Error('OPENAI_API_KEY is not set.');
        }

        const response = await this.openai.chat.completions.create({
            model: options.model ?? process.env.OPENAI_FAILURE_ANALYSIS_MODEL ?? 'gpt-4o-mini',
            messages: options.messages,
            max_tokens: options.maxTokens ?? 900
        });

        return response.choices?.[0]?.message?.content ?? '';
    }

    async analyzeFailure(errorMessage: string, xmlPath?: string, screenshotPath?: string): Promise<string> {
        if (!this.openai) {
            return 'AI Analysis skipped: OPENAI_API_KEY is not set.';
        }

        try {
            const xmlContent = xmlPath && fs.existsSync(xmlPath)
                ? fs.readFileSync(xmlPath, 'utf-8').slice(0, 4000)
                : 'XML page source is unavailable.';
            const userContent: OpenAI.Chat.ChatCompletionUserMessageParam['content'] = [
                {
                    type: 'text',
                    text:
                        `The automation test failed with error: "${errorMessage}".\n` +
                        'Analyze the available artifacts, identify the most likely root cause, and provide a concise fix.'
                },
                {
                    type: 'text',
                    text: `XML Page Source:\n---\n${xmlContent}\n---`
                }
            ];

            if (screenshotPath && fs.existsSync(screenshotPath)) {
                const screenshotBase64 = fs.readFileSync(screenshotPath, { encoding: 'base64' });
                userContent.push({
                    type: 'image_url',
                    image_url: {
                        url: `data:image/png;base64,${screenshotBase64}`,
                        detail: 'low'
                    }
                });
            }

            return await this.createChatCompletion({
                messages: [
                    {
                        role: 'system',
                        content: 'You are a Senior SDET AI Assistant. Diagnose test failures using the provided automation artifacts.'
                    },
                    {
                        role: 'user',
                        content: userContent
                    }
                ],
                maxTokens: 600
            });
        } catch (error) {
            return `AI Error: ${(error as Error).message}`;
        }
    }
}

export default new AIService();
