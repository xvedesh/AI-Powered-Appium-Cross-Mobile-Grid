// android.login.page.ts
import { ILoginPage } from '../LoginPage';
import { LOGIN_SCREEN } from '../../config/constants';

class AndroidLoginPage implements ILoginPage {
    private get usernameField() { return $(LOGIN_SCREEN.USERNAME.android); }
    private get passwordField() { return $(LOGIN_SCREEN.PASSWORD.android); }
    private get loginButton() { return $(LOGIN_SCREEN.LOGIN_BTN.android); }
    private get userNameLink() { return $(LOGIN_SCREEN.USERNAME_LINK.android); }
    private get errorContainer() { return $('//android.view.ViewGroup[@content-desc="test-Error message"]/android.widget.TextView'); }

    async login(username: string, password: string): Promise<void> {
        await this.usernameField.waitForDisplayed({ timeout: 10000 });
        await this.passwordField.waitForDisplayed({ timeout: 10000 });
        await this.usernameField.setValue(username);
        await this.passwordField.setValue(password);
        await this.loginButton.waitForDisplayed({ timeout: 10000 });
        await this.loginButton.click();
    };

    async clickCredentialsLink(): Promise<void> {
        await this.userNameLink.waitForDisplayed({ timeout: 10000});
        await this.userNameLink.click();
    }

    async clickLoginButton(): Promise<void> {
        await this.loginButton.waitForDisplayed({ timeout: 10000 });
        await this.loginButton.click();
    }

    async getErrorMessage(): Promise<string> {
        await this.errorContainer.waitForDisplayed();
        return await this.errorContainer.getText();
    };
};
export default new AndroidLoginPage();
