import { IHomePage } from '../HomePage';

class WebHomePage implements IHomePage {
    private get productsHeader() { return $('.title'); }

    async isPageLoaded(): Promise<boolean> {
        await this.productsHeader.waitForDisplayed({ timeout: 5000 });
        return this.productsHeader.isDisplayed();
    }

    async getProductLabelText(): Promise<string> {
        return this.productsHeader.getText();
    }

    async openMenu(): Promise<void> {
        // Web login flow has no pre-login "More -> Login" navigation.
    }
}

export default new WebHomePage();
