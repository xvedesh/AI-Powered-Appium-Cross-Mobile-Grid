import { IMainMenuPage } from '../MainMenuPage';

class WebMenuPage implements IMainMenuPage {
    async selectLogin(): Promise<void> {
        // Web login flow opens directly at / (login form), no menu selection required.
    }
}

export default new WebMenuPage();
