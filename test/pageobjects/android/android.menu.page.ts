import { IMainMenuPage } from '../MainMenuPage';
import { MENU_SCREEN } from '../../config/constants';

class AndroidMenuPage implements IMainMenuPage {
    async selectLogin(): Promise<void> {
        const loginItem = $(MENU_SCREEN.LOGIN_ITEM.android);
        await loginItem.waitForDisplayed({ timeout: 5000 });
        await loginItem.click();
    }
}

export default new AndroidMenuPage();
