import { ICatalogPage, PaymentDetails, ShippingDetails } from '../CatalogPage';

class WebCatalogPage implements ICatalogPage {
    private unsupported(methodName: string): never {
        throw new Error(`Web catalog flow method not implemented: ${methodName}`);
    }

    async scrollAndClickItemByTitle(): Promise<void> {
        this.unsupported('scrollAndClickItemByTitle');
    }

    async addCurrentItemToCart(): Promise<void> {
        this.unsupported('addCurrentItemToCart');
    }

    async openCart(): Promise<void> {
        this.unsupported('openCart');
    }

    async proceedToCheckout(): Promise<void> {
        this.unsupported('proceedToCheckout');
    }

    async fillShippingAddress(_data: ShippingDetails): Promise<void> {
        this.unsupported('fillShippingAddress');
    }

    async goToPayment(): Promise<void> {
        this.unsupported('goToPayment');
    }

    async fillPaymentDetails(_data: PaymentDetails): Promise<void> {
        this.unsupported('fillPaymentDetails');
    }

    async ensureBillingAddressSameAsShippingSelected(): Promise<void> {
        this.unsupported('ensureBillingAddressSameAsShippingSelected');
    }

    async reviewOrder(): Promise<void> {
        this.unsupported('reviewOrder');
    }

    async isReviewOrderPageLoaded(): Promise<boolean> {
        this.unsupported('isReviewOrderPageLoaded');
    }

    async placeOrder(): Promise<void> {
        this.unsupported('placeOrder');
    }

    async waitForCheckoutCompletePage(): Promise<void> {
        this.unsupported('waitForCheckoutCompletePage');
    }

    async waitForContinueShoppingButton(): Promise<void> {
        this.unsupported('waitForContinueShoppingButton');
    }

    async continueShopping(): Promise<void> {
        this.unsupported('continueShopping');
    }
}

export default new WebCatalogPage();
