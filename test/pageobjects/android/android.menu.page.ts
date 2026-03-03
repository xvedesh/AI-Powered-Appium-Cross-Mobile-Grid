import { IMainMenuPage } from '../MainMenuPage';

class AndroidMenuPage implements IMainMenuPage {
    async selectLogin(): Promise<void> {
        // TODO: replace with real Android login menu locator
        const loginItem = $('PUT_LOCATOR_HERE');
        await loginItem.waitForDisplayed({ timeout: 5000 });
        await loginItem.click();
    }
}

export default new AndroidMenuPage();
