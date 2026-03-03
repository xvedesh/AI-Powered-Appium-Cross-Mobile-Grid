// web.login.page.ts
import { ILoginPage } from '../LoginPage';

class WebLoginPage implements ILoginPage {
    private get usernameField() { return $('#user-name'); }
    private get passwordField() { return $('#password'); }
    private get loginButton() { return $('#login-button'); }
    private get errorContainer() { return $('[data-test="error"]'); }

    async login(username: string, password: string): Promise<void> {
        await browser.url('https://www.saucedemo.com');
        await this.usernameField.setValue(username);
        await this.passwordField.setValue(password);
        await this.loginButton.click();
    };

    async getErrorMessage(): Promise<string> {
        await this.errorContainer.waitForDisplayed();
        return await this.errorContainer.getText();
    };
};
export default new WebLoginPage();