import iosLogin from './ios/ios.login.page';
import androidLogin from './android/android.login.page';
import webLogin from './web/web.login.page';

import iosHome from './ios/ios.home.page';
import androidHome from './android/android.home.page';
import webHome from './web/web.home.page';

import iosMenu from './ios/ios.menu.page';
import androidMenu from './android/android.menu.page';
import webMenu from './web/web.menu.page';
import iosCatalog from './ios/ios.catalog.page';
import androidCatalog from './android/android.catalog.page';
import webCatalog from './web/web.catalog.page';

import { ILoginPage } from './LoginPage';
import { IHomePage } from './HomePage';
import { IMainMenuPage } from './MainMenuPage';
import { ICatalogPage } from './CatalogPage';

export class PageFactory {
    private static get isMobileWeb(): boolean {
        const browserName = (driver.capabilities.browserName ?? '').toString().toLowerCase();
        return Boolean(browserName);
    }

    /**
     * Centralized factory to return the correct LoginPage implementation
     */
    static get login(): ILoginPage {
        if (this.isMobileWeb) {
            return webLogin;
        }
        if (driver.isMobile) {
            return driver.isIOS ? iosLogin : androidLogin;
        }
        return webLogin;
    }

    /**
     * Centralized factory to return the correct HomePage implementation
     */
    static get home(): IHomePage {
        if (this.isMobileWeb) {
            return webHome;
        }
        if (driver.isMobile) {
            return driver.isIOS ? iosHome : androidHome;
        }
        return webHome;
    }

    /**
     * New Menu Page implementation for the 'More' tab flow
     */
    static get menu(): IMainMenuPage {
        if (this.isMobileWeb) {
            return webMenu;
        }
        if (driver.isMobile) {
            return driver.isIOS ? iosMenu : androidMenu;
        }
        return webMenu;
    }

    static get catalog(): ICatalogPage {
        if (this.isMobileWeb) {
            return webCatalog;
        }
        if (driver.isMobile) {
            return driver.isIOS ? iosCatalog : androidCatalog;
        }
        return webCatalog;
    }
}

export default PageFactory;
