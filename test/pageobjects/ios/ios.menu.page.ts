import { IMainMenuPage } from '../MainMenuPage';
import { MENU_SCREEN } from '../../config/constants';

class IosMenu implements IMainMenuPage {
    async selectLogin(): Promise<void> {
        await $(MENU_SCREEN.LOGIN_ITEM.ios).waitForDisplayed();
        await $(MENU_SCREEN.LOGIN_ITEM.ios).click();
    }
}
export default new IosMenu();