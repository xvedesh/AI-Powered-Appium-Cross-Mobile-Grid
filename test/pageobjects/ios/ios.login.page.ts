// ios.login.page.ts
import { ILoginPage } from '../LoginPage';
import { LOGIN_SCREEN } from '../../config/constants';

class IOSLoginPage implements ILoginPage {
    private get usernameField() { return $(LOGIN_SCREEN.USERNAME.ios); }
    private get passwordField() { return $(LOGIN_SCREEN.PASSWORD.ios); }
    private get loginButton() { return $(LOGIN_SCREEN.LOGIN_BTN.ios); }
    private get errorContainer() { return $('~test-Error message'); }
    private get userNameLink() { return $(LOGIN_SCREEN.USERNAME_LINK.ios); }

    async login(username: string, password: string): Promise<void> {
        await this.usernameField.waitForExist({ timeout: 10000 });
        await this.passwordField.waitForExist({ timeout: 10000 });

        await this.usernameField.setValue(username);
        await this.passwordField.setValue(password);

        try {
            await driver.hideKeyboard();
        } catch {
            try {
                await driver.keys(['Return']);
            } catch {
                // keyboard may already be hidden
            }
        }

        await this.loginButton.waitForDisplayed({ timeout: 10000 });
        await this.loginButton.click();
    };

    async clickUserNameLink(): Promise<void> {
        await this.userNameLink.waitForDisplayed({timeout: 10000});
        await this.userNameLink.click();
        await this.loginButton.waitForDisplayed({ timeout: 10000 });
        await this.loginButton.click();

    };

    async getErrorMessage(): Promise<string> {
        await this.errorContainer.waitForDisplayed();
        return await this.errorContainer.getText();
    };
};
export default new IOSLoginPage();
