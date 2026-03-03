import { browser } from '@wdio/globals'

/**
* Основной объект для Native Mobile App.
*/
export default class Page {
    /**
     * Кастомный метод клика для Native App.
     * Мы ждем Displayed (визуально на экране) и Enabled (доступен в системе).
     */
    async clickElement(element: ChainablePromiseElement) {
        await element.waitForDisplayed({ timeout: 10000 });
        
        // В нативках иногда элемент виден, но еще не готов к тапу (анимация)
        if (await element.isEnabled()) {
            await element.click();
        } else {
            // Если не enabled, ждем еще немного (умный ретрай)
            await element.waitForEnabled({ timeout: 5000 });
            await element.click();
        }
    }

    /**
     * Метод для логирования действий.
     */
    async logStep(message: string) {
        console.log(`[STEP]: ${message}`);
    }

    /**
     * Нативный метод ожидания исчезновения элемента (например, прогресс-бара)
     */
    async waitForLoaderToDisappear(element: ChainablePromiseElement) {
        await element.waitForDisplayed({ reverse: true, timeout: 15000 });
    }
}