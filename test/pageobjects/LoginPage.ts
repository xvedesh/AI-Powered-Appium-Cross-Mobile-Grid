export interface ILoginPage {
    login(username: string, password: string): Promise<void>;
    clickCredentialsLink(): Promise<void>;
    clickLoginButton(): Promise<void>;
    getErrorMessage(): Promise<string>;
};
