import { IHomePage } from '../HomePage';

class WebHomePage implements IHomePage {
    // Standard CSS selector for the inventory page title
    private get productsHeader() { return $('.title'); };

    async isPageLoaded(): Promise<boolean> {
        await this.productsHeader.waitForDisplayed({ timeout: 5000 });
        return await this.productsHeader.isDisplayed();
    };

    async getProductLabelText(): Promise<string> {
        return await this.productsHeader.getText();
    };

    async openMenu(): Promise<void> {
        // TODO: replace with real Web menu locator
        const menuButton = $('PUT_LOCATOR_HERE');
        await menuButton.waitForDisplayed({ timeout: 5000 });
        await menuButton.click();
    };
};

export default new WebHomePage();
