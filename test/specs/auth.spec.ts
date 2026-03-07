import PageFactory from '../pageobjects/PageFactory';
import { USERS } from '../data/users';

describe('Authentication Suite', () => {
    it('should login successfully via Main Menu', async function () {
        const homePage = PageFactory.home;
        const menuPage = PageFactory.menu;
        const loginPage = PageFactory.login;

        // 1. Navigation Home -> Menu -> Login
        await homePage.openMenu();
        await menuPage.selectLogin();

        // 2. Login
        //if keyboard is working properly we use loginPage.login
        //await loginPage.login(USERS.SUCCESS.user ?? '', USERS.SUCCESS.pass ?? '');
        await loginPage.clickUserNameLink();

        // 3. Validate result
        expect(await homePage.isPageLoaded()).toBe(true);
    });
});
