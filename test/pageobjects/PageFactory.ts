import iosLogin from './ios/ios.login.page';
import androidLogin from './android/android.login.page';
import webLogin from './web/web.login.page';

import iosHome from './ios/ios.home.page';
import androidHome from './android/android.home.page';
import webHome from './web/web.home.page';

import iosMenu from './ios/ios.menu.page';
import androidMenu from './android/android.menu.page';
import webMenu from './web/web.menu.page';

import { ILoginPage } from './LoginPage';
import { IHomePage } from './HomePage';
import { IMainMenuPage } from './MainMenuPage';

export class PageFactory {
    /**
     * Centralized factory to return the correct LoginPage implementation
     */
    static get login(): ILoginPage {
        if (driver.isMobile) {
            return driver.isIOS ? iosLogin : androidLogin;
        }
        return webLogin;
    }

    /**
     * Centralized factory to return the correct HomePage implementation
     */
    static get home(): IHomePage {
        if (driver.isMobile) {
            return driver.isIOS ? iosHome : androidHome;
        }
        return webHome;
    }

    /**
     * New Menu Page implementation for the 'More' tab flow
     */
    static get menu(): IMainMenuPage {
        if (driver.isMobile) {
            return driver.isIOS ? iosMenu : androidMenu;
        }
        return webMenu;
    }
}

export default PageFactory;
