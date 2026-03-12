import { IMainMenuPage } from '../MainMenuPage';
import { MENU_SCREEN } from '../../config/constants';

class AndroidMenuPage implements IMainMenuPage {
    async selectLoginMenuItem(): Promise<void> {
        const loginMenuItem = $(MENU_SCREEN.LOGIN_MENU_ITEM.android);
        await loginMenuItem.waitForDisplayed({ timeout: 5000 });
        await loginMenuItem.click();
    }
    async selectCatalogMenuItem(): Promise<void> {
        const catalogMenuItem = $(MENU_SCREEN.CATALOG_MENU_ITEM.android);
        await catalogMenuItem.waitForDisplayed({timeout: 5000});
        await catalogMenuItem.click();
    }
}

export default new AndroidMenuPage();
