export interface ILoginPage {
    login(username: string, password: string): Promise<void>;
    getErrorMessage(): Promise<string>;
};