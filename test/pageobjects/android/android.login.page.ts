// android.login.page.ts
import { ILoginPage } from '../LoginPage';

class AndroidLoginPage implements ILoginPage {
    private get usernameField() { return $('~test-Username'); }
    private get passwordField() { return $('~test-Password'); }
    private get loginButton() { return $('~test-LOGIN'); }
    private get errorContainer() { return $('//android.view.ViewGroup[@content-desc="test-Error message"]/android.widget.TextView'); }

    async login(username: string, password: string): Promise<void> {
        await this.usernameField.setValue(username);
        await this.passwordField.setValue(password);
        await this.loginButton.click();
    };

    async getErrorMessage(): Promise<string> {
        await this.errorContainer.waitForDisplayed();
        return await this.errorContainer.getText();
    };
};
export default new AndroidLoginPage();