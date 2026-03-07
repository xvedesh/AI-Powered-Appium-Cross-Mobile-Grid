import { IHomePage } from '../HomePage';
import { HOME_SCREEN } from '../../config/constants';

class IosHome implements IHomePage {
    async isPageLoaded(): Promise<boolean> {
        const catalogScreen = $(HOME_SCREEN.CATALOG_SCREEN.ios);
        await catalogScreen.waitForDisplayed({ timeout: 10000 });
        return true;
    }

    async getProductLabelText(): Promise<string> {
        return await $(HOME_SCREEN.PRODUCT_LABEL.ios).getText();
    }

    async openMenu(): Promise<void> {
        const moreTab = $(HOME_SCREEN.HAMBURGER_MENU.ios);
        await moreTab.waitForDisplayed({ timeout: 10000 });
        await moreTab.click();
    }
}
export default new IosHome();
