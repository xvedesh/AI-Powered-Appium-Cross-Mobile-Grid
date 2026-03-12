import { IMainMenuPage } from '../MainMenuPage';

class WebMenuPage implements IMainMenuPage {
    async selectLoginMenuItem(): Promise<void> {
        // Web login flow opens directly at / (login form), no menu selection required.
    }
    async selectCatalogMenuItem(): Promise<void> {
        
    }
}

export default new WebMenuPage();
