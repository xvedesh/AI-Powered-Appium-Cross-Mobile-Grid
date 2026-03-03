import { IMainMenuPage } from '../MainMenuPage';

class WebMenuPage implements IMainMenuPage {
    async selectLogin(): Promise<void> {
        // TODO: replace with real Web login menu locator
        const loginItem = $('PUT_LOCATOR_HERE');
        await loginItem.waitForDisplayed({ timeout: 5000 });
        await loginItem.click();
    }
}

export default new WebMenuPage();
