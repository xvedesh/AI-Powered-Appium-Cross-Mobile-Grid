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
    selectCatalogMenuItem(): Promise<void>;
    selectBackpackYellowItem(): Promise<void>;
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
    isCheckoutCompletePageLoaded(): Promise<boolean>;
    isContinueShoppingButtonClickable(): Promise<boolean>;
    continueShopping(): Promise<void>;
}
