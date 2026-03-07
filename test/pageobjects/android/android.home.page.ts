import { IHomePage } from '../HomePage';
import { HOME_SCREEN } from '../../config/constants';

class AndroidHomePage implements IHomePage {
    private get productsHeader() {
        return $(HOME_SCREEN.PRODUCT_LABEL.android);
    }
    private get hamburgerTab() {
        return $(HOME_SCREEN.HAMBURGER_MENU.android);
    }

    async isPageLoaded(): Promise<boolean> {
        const catalogScreen = $(HOME_SCREEN.CATALOG_SCREEN.android);
        await catalogScreen.waitForDisplayed({ timeout: 10000 });
        return true;
    }

    async getProductLabelText(): Promise<string> {
        return await this.productsHeader.getText();
    }

    async openMenu(): Promise<void> {
        await this.hamburgerTab.waitForDisplayed({ timeout: 10000 });
        await this.hamburgerTab.click();
    }
}

export default new AndroidHomePage();
