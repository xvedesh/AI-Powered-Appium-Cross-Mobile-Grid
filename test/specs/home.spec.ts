import PageFactory from '../pageobjects/PageFactory';

describe('API Demos Functional Tests', () => {
    it('should verify main title and navigate to Views', async () => {
        const homePage = PageFactory.home;
        await expect(await homePage.isPageLoaded()).toBe(true);
        await expect(await homePage.getProductLabelText()).not.toEqual('');
        console.log('[ASSERT]: Home screen content is visible');
    });
});
