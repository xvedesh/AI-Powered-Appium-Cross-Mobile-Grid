import { ENV } from '../config/env.provider';

class DataManager {
    /**
     * Удаление тестовых данных через API бэкенда.
     * Мы вызываем это в afterSuite или afterTest.
     */
    async cleanupUser(userId: string) {
        console.log(`[CLEANUP]: Removing user ${userId} from ${ENV.envName} environment...`);
        
        // Здесь в будущем будет вызов axios или fetch
        // await axios.delete(`${ENV.baseUrl}/api/users/${userId}`);
        
        console.log(`[CLEANUP]: Success.`);
    }

    /**
     * Сброс состояния приложения (Clear Cache/Data)
     */
    /**
     * Сброс состояния приложения (Clear Cache/Data)
     */
    async resetApp() {
        const appId = 'io.appium.android.apis';
        
        try {
            if (driver.isAndroid) {
                await this.logStep(`Resetting app: ${appId}`);
                // Используем мобильную команду напрямую через execute
                await driver.execute('mobile: clearApp', { appId: appId });
            } else {
                // Для iOS обычно используют removeApp и installApp, 
                // так как прямого clearApp нет
                await driver.terminateApp(appId);
                await driver.execute('mobile: removeApp', { bundleId: appId });
                // installApp будет здесь, если нужно
            }
        } catch (error) {
            console.error(`[DataManager Error]: Could not reset app ${appId}: ${error}`);
        }
    }

    private async logStep(msg: string) {
        console.log(`[DATA MANAGER]: ${msg}`);
    }
}

export default new DataManager();