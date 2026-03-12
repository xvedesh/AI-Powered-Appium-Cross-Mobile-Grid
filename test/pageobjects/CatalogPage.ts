export type ShippingDetails = {
    fullName: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    stateRegion: string;
    zipCode: string;
    country: string;
};

export type PaymentDetails = {
    fullName: string;
    cardNumber: string;
    expirationDate: string;
    securityCode: string;
};

export interface ICatalogPage {
    scrollAndClickItemByTitle(): Promise<void>;
    addCurrentItemToCart(): Promise<void>;
    openCart(): Promise<void>;
    proceedToCheckout(): Promise<void>;
    fillShippingAddress(data: ShippingDetails): Promise<void>;
    goToPayment(): Promise<void>;
    fillPaymentDetails(data: PaymentDetails): Promise<void>;
    ensureBillingAddressSameAsShippingSelected(): Promise<void>;
    reviewOrder(): Promise<void>;
    isReviewOrderPageLoaded(): Promise<boolean>;
    placeOrder(): Promise<void>;
    waitForCheckoutCompletePage(): Promise<void>;
    waitForContinueShoppingButton(): Promise<void>;
    continueShopping(): Promise<void>;
}
