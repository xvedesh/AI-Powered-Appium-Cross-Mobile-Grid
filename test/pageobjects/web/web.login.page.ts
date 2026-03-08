// web.login.page.ts
import { ILoginPage } from '../LoginPage';
import { ENV } from '../../config/env.provider';
import { LOGIN_SCREEN } from '../../config/constants';
import { USERS } from '../../data/users';

class WebLoginPage implements ILoginPage {
    private get usernameField() { return $('#user-name'); }
    private get passwordField() { return $('#password'); }
    private get loginButton() { return $('#login-button'); }
    private get userNameLink() { return $(LOGIN_SCREEN.USERNAME_LINK.web); }
    private get errorContainer() { return $('[data-test="error"]'); }

    async login(username: string, password: string): Promise<void> {
        await browser.url(ENV.baseUrl);
        await this.usernameField.setValue(username);
        await this.passwordField.setValue(password);
        await this.loginButton.click();
    }

    async clickCredentialsLink(): Promise<void> {
        if (LOGIN_SCREEN.USERNAME_LINK.web) {
            await this.userNameLink.waitForDisplayed({ timeout: 10000 });
            await this.userNameLink.click();
            return;
        }

        await this.usernameField.waitForDisplayed({ timeout: 10000 });
        await this.usernameField.setValue(USERS.SUCCESS.user ?? '');
        await this.passwordField.setValue(USERS.SUCCESS.pass ?? '');
    }

    async clickLoginButton(): Promise<void> {
        await this.loginButton.waitForDisplayed({ timeout: 10000 });
        await this.loginButton.click();
    }

    async getErrorMessage(): Promise<string> {
        await this.errorContainer.waitForDisplayed();
        return this.errorContainer.getText();
    }
}
export default new WebLoginPage();
