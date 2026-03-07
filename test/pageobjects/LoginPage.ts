export interface ILoginPage {
    login(username: string, password: string): Promise<void>;
    clickUserNameLink(): Promise<void>;
    getErrorMessage(): Promise<string>;
};

export interface IClickUserNameLink {

}