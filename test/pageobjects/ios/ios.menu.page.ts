import { IMainMenuPage } from '../MainMenuPage';
import { MENU_SCREEN } from '../../config/constants';

class IosMenu implements IMainMenuPage {
    async selectLoginMenuItem(): Promise<void> {
        const loginButton = $(MENU_SCREEN.LOGIN_MENU_ITEM.ios);
        await loginButton.waitForDisplayed({ timeout: 10000 });
        await loginButton.click();
    }
    async selectCatalogMenuItem(): Promise<void> {
        
    }
}
export default new IosMenu();
