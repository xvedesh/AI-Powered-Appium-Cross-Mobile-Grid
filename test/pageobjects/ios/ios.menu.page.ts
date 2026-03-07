import { IMainMenuPage } from '../MainMenuPage';
import { MENU_SCREEN } from '../../config/constants';

class IosMenu implements IMainMenuPage {
    async selectLogin(): Promise<void> {
        const loginButton = $(MENU_SCREEN.LOGIN_ITEM.ios);
        await loginButton.waitForDisplayed({ timeout: 10000 });
        await loginButton.click();
    }
}
export default new IosMenu();
