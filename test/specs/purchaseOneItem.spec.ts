import allureReporter from '@wdio/allure-reporter';
import { CHECKOUT_DATA } from '../data/checkout';
import PageFactory from '../pageobjects/PageFactory';

const platformLabel = process.env.PLATFORM ?? 'unknown-platform';

describe(`Purchase One Item Test [${platformLabel}]`, () => {
    it(`user should be able to purchase one catalog item [${platformLabel}]`, async function () {
        const homePage = PageFactory.home;
        const loginPage = PageFactory.login;
        const catalogPage = PageFactory.catalog;
        const menuPage = PageFactory.menu;

        allureReporter.addFeature('Purchase One Item Flow');
        allureReporter.addStory('Purchase One Item From Catalog');
        allureReporter.addDescription(`User purchases ${CHECKOUT_DATA.productName} through checkout and returns to shopping.`);

        await allureReporter.step('User is on the Home Page', async () => {
            expect(await homePage.isPageLoaded()).toBe(true);
        });

        await allureReporter.step('User click Hamburger Menu', async () => {
            await homePage.openMenu();
        });

        await allureReporter.step('User click Login menu', async () => {
            await menuPage.selectLoginMenuItem();
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

        await allureReporter.step(`User opens the Catalog and selects ${CHECKOUT_DATA.productName}`, async () => {
            await homePage.openMenu();
            await menuPage.selectCatalogMenuItem();
            await catalogPage.scrollAndClickItemByTitle();
        });

        await allureReporter.step('User adds the item to cart and starts checkout', async () => {
            await catalogPage.addCurrentItemToCart();
            await catalogPage.openCart();
            await catalogPage.proceedToCheckout();
        });

        await allureReporter.step('User fills shipping details and proceeds to payment', async () => {
            await catalogPage.fillShippingAddress(CHECKOUT_DATA.shipping);
            await catalogPage.goToPayment();
        });

        await allureReporter.step('User fills payment details and reviews the order', async () => {
            await catalogPage.fillPaymentDetails(CHECKOUT_DATA.payment);
            await catalogPage.ensureBillingAddressSameAsShippingSelected();
            await catalogPage.reviewOrder();
        });

        await allureReporter.step('Review order page is displayed', async () => {
            await expect(await catalogPage.isReviewOrderPageLoaded()).toBe(true);
        });

        await allureReporter.step('User places the order and sees checkout complete state', async () => {
            await catalogPage.placeOrder();
            await catalogPage.waitForCheckoutCompletePage();
            await catalogPage.waitForContinueShoppingButton();
        });

        await allureReporter.step('User continues shopping', async () => {
            await catalogPage.continueShopping();
        });
    });
});
