import OpenAI from 'openai';
import * as fs from 'fs';

class AIService {
    private openai: OpenAI | null = null;

    constructor() {
        // Ключ берем из переменных окружения (.env), чтобы не хардкодить
        const apiKey = process.env.OPENAI_API_KEY;
        if (apiKey) {
            this.openai = new OpenAI({ apiKey });
        }
    }

    /**
     * Анализирует XML-структуру экрана и ошибку с помощью ИИ
     */
    async analyzeFailure(errorMessage: string, xmlPath: string, screenshotPath: string) {
        if (!this.openai) return "AI Analysis skipped.";

        try {
            const xmlContent = fs.readFileSync(xmlPath, 'utf-8').substring(0, 4000);
            const screenshotBase64 = fs.readFileSync(screenshotPath, { encoding: 'base64' });

            const response = await this.openai.chat.completions.create({
                model: "gpt-4o-mini", // Или gpt-4o для более глубокого анализа
                messages: [
                    {
                        role: "system",
                        content: "You are a Senior SDET AI Assistant. Your goal is to diagnose test automation failures using XML source and screenshots."
                    },
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: `The automation test failed with error: "${errorMessage}".
                            
                            Your Task:
                            1. Analyze the provided XML. 
                            2. Analyze the Screenshot.
                            3. Identify the error reason.
                            4. Provide a concise explanation of the root cause.
                            3. Suggest a definitive solution.`
                            },
                            {
                                type: "text",
                                text: `XML Page Source:
                            ---
                            ${xmlContent}
                            ---`
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/png;base64,${screenshotBase64}`,
                                    detail: "low" // "low" экономит токены и деньги, "high" — для мелких деталей верстки
                                }
                            }
                        ],
                    },
                ],
                max_tokens: 600,
            });

            return response.choices[0].message.content;
        } catch (error: any) {
            return `AI Error: ${error.message}`;
        }
    }
}

export default new AIService();