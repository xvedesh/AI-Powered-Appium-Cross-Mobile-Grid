import { IHomePage } from '../HomePage';

class AndroidHomePage implements IHomePage {
    /** * In Android, the header is a TextView with the text 'PRODUCTS'.
     * We use XPath here to target the specific text attribute.
     */
    private get productsHeader() { 
        return $('//android.widget.TextView[@text="PRODUCTS"]'); 
    };

    async isPageLoaded(): Promise<boolean> {
        // Wait up to 10 seconds for the header to appear after login
        await this.productsHeader.waitForDisplayed({ timeout: 10000 });
        return await this.productsHeader.isDisplayed();
    };

    async getProductLabelText(): Promise<string> {
        return await this.productsHeader.getText();
    };

    async openMenu(): Promise<void> {
        // TODO: replace with real Android menu locator
        const menuButton = $('PUT_LOCATOR_HERE');
        await menuButton.waitForDisplayed({ timeout: 5000 });
        await menuButton.click();
    };
};

export default new AndroidHomePage();
