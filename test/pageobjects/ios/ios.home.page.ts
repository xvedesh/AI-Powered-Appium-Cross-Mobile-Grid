import { IHomePage } from '../HomePage';
import { HOME_SCREEN } from '../../config/constants';

class IosHome implements IHomePage {
    async isPageLoaded(): Promise<boolean> {
        return await $(HOME_SCREEN.MORE_TAB.ios).isDisplayed();
    }

    async getProductLabelText(): Promise<string> {
        return await $(HOME_SCREEN.PRODUCT_LABEL.ios).getText();
    }

    async openMenu(): Promise<void> {
        await $(HOME_SCREEN.MORE_TAB.ios).click();
    }
}
export default new IosHome();