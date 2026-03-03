import { driver } from '@wdio/globals'
import * as fs from 'fs';
import * as path from 'path';
import AIService from './AIService';

class ContextCollector {
    private readonly reportDir = path.join(process.cwd(), 'test', 'errorShots');

    constructor() {
        if (!fs.existsSync(this.reportDir)) {
            fs.mkdirSync(this.reportDir, { recursive: true });
        }
    }

    async collectErrorContext(testTitle: string, errorMessage: string) {
        console.log(`>>> [DEBUG]: Starting Context Collection for: ${testTitle}`);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileNameBase = `${testTitle.replace(/\s+/g, '_')}_${timestamp}`;

        // 1. Сначала сохраняем скриншот, чтобы получить его путь
        const screenshotPath = path.join(this.reportDir, `${fileNameBase}.png`);
        await driver.saveScreenshot(screenshotPath);
        console.log(`>>> [DEBUG]: Screenshot saved: ${screenshotPath}`);

        // 2. Сохраняем XML
        const pageSource = await driver.getPageSource();
        const xmlPath = path.join(this.reportDir, `${fileNameBase}.xml`);
        fs.writeFileSync(xmlPath, pageSource);
        console.log(`>>> [DEBUG]: XML saved: ${xmlPath}`);

        // 3. ОБНОВЛЕННЫЙ ВЫЗОВ: Передаем errorMessage, xmlPath И screenshotPath
        console.log(`>>> [DEBUG]: Requesting Multimodal AI Diagnosis (XML + PNG)...`);
        const aiDiagnosis = await AIService.analyzeFailure(errorMessage, xmlPath, screenshotPath);

        // 4. Формируем манифест
        const manifest = {
            test: testTitle,
            error: errorMessage,
            aiDiagnosis: aiDiagnosis, // Здесь будет расширенный ответ с учетом картинки
            timestamp: timestamp,
            files: {
                screenshot: screenshotPath,
                xmlSource: xmlPath
            },
            device: driver.capabilities
        };

        const manifestPath = path.join(this.reportDir, `${fileNameBase}_manifest.json`);
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        
        console.log(`>>> [DEBUG]: Manifest saved with AI Vision analysis: ${manifestPath}`);
        return manifest;
    }
}

export default new ContextCollector();