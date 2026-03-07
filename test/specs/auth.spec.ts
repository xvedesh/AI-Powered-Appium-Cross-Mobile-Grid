import PageFactory from '../pageobjects/PageFactory';
import allureReporter from '@wdio/allure-reporter';

const platformLabel = process.env.TEST_PLATFORM ?? process.env.PLATFORM ?? 'unknown-platform';

describe(`Authentication Suite [${platformLabel}]`, () => {
    it(`should login successfully via Main Menu [${platformLabel}]`, async function () {
        const homePage = PageFactory.home;
        const menuPage = PageFactory.menu;
        const loginPage = PageFactory.login;

        allureReporter.addFeature('Authentication');
        allureReporter.addStory('Login via Main Menu');
        allureReporter.addDescription('User logs in from the hamburger menu and returns to Home Page.');

        await allureReporter.step('User is on the Home Page', async () => {
            await expect(await homePage.isPageLoaded()).toBe(true);
        });

        await allureReporter.step('User click Hamburger Menu', async () => {
            await homePage.openMenu();
        });

        await allureReporter.step('User click Login menu', async () => {
            await menuPage.selectLogin();
        });

        await allureReporter.step('User click credentials link', async () => {
            await loginPage.clickCredentialsLink();
        });

        await allureReporter.step('User clicks Login Button', async () => {
            await loginPage.clickLoginButton();
        });

        await allureReporter.step('User is logged in and redirected on Home Page', async () => {
            await expect(await homePage.isPageLoaded()).toBe(true);
        });
    });
});
