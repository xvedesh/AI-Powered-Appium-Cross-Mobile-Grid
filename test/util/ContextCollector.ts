import { driver } from '@wdio/globals'
import * as fs from 'fs';
import * as path from 'path';

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

        // 3. Формируем манифест для post-run AI анализа
        const manifest = {
            test: testTitle,
            error: errorMessage,
            aiStatus: 'pending',
            aiDiagnosis: null,
            timestamp: timestamp,
            files: {
                screenshot: screenshotPath,
                xmlSource: xmlPath
            },
            device: driver.capabilities
        };

        const manifestPath = path.join(this.reportDir, `${fileNameBase}_manifest.json`);
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        
        console.log(`>>> [DEBUG]: Manifest saved for post-run AI analysis: ${manifestPath}`);
        return manifest;
    }
}

export default new ContextCollector();
