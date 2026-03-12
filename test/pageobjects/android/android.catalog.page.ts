import { PURCHASE_FLOW } from '../../config/constants';
import { CHECKOUT_DATA } from '../../data/checkout';
import { ICatalogPage, PaymentDetails, ShippingDetails } from '../CatalogPage';

class AndroidCatalogPage implements ICatalogPage {
    private get item() { return $(PURCHASE_FLOW.ITEM.android(CHECKOUT_DATA.productName)); }
    private get cartIcon() { return $(PURCHASE_FLOW.CART_ICON.android); }
    private get proceedToCheckoutButton() { return $(PURCHASE_FLOW.PROCEED_TO_CHECKOUT_BUTTON.android); }
    private get shippingFullNameField() { return $(PURCHASE_FLOW.SHIPPING_FULL_NAME.android); }
    private get shippingAddressLine1Field() { return $(PURCHASE_FLOW.SHIPPING_ADDRESS_LINE_1.android); }
    private get shippingAddressLine2Field() { return $(PURCHASE_FLOW.SHIPPING_ADDRESS_LINE_2.android); }
    private get shippingCityField() { return $(PURCHASE_FLOW.SHIPPING_CITY.android); }
    private get shippingStateRegionField() { return $(PURCHASE_FLOW.SHIPPING_STATE_REGION.android); }
    private get shippingZipCodeField() { return $(PURCHASE_FLOW.SHIPPING_ZIP_CODE.android); }
    private get shippingCountryField() { return $(PURCHASE_FLOW.SHIPPING_COUNTRY.android); }
    private get toPaymentButton() { return $(PURCHASE_FLOW.TO_PAYMENT_BUTTON.android); }
    private get paymentFullNameField() { return $(PURCHASE_FLOW.PAYMENT_FULL_NAME.android); }
    private get paymentCardNumberField() { return $(PURCHASE_FLOW.PAYMENT_CARD_NUMBER.android); }
    private get paymentExpirationDateField() { return $(PURCHASE_FLOW.PAYMENT_EXPIRATION_DATE.android); }
    private get paymentSecurityCodeField() { return $(PURCHASE_FLOW.PAYMENT_SECURITY_CODE.android); }
    private get billingAddressCheckbox() { return $(PURCHASE_FLOW.BILLING_ADDRESS_CHECKBOX.android); }
    private get reviewOrderButton() { return $(PURCHASE_FLOW.REVIEW_ORDER_BUTTON.android); }
    private get reviewOrderAnchor() { return $(PURCHASE_FLOW.REVIEW_ORDER_PAGE_ANCHOR.android); }
    private get placeOrderButton() { return $(PURCHASE_FLOW.PLACE_ORDER_BUTTON.android); }
    private get checkoutCompleteAnchor() { return $(PURCHASE_FLOW.CHECKOUT_COMPLETE_PAGE_ANCHOR.android); }
    private get continueShoppingButton() { return $(PURCHASE_FLOW.CONTINUE_SHOPPING_BUTTON.android); }

    async scrollAndClickItemByTitle(): Promise<void> {
        await $(PURCHASE_FLOW.ANDROID_SCROLL.toText(CHECKOUT_DATA.productName));
        await this.item.waitForDisplayed({ timeout: 5000 });
        await this.item.click();
    }

    async addCurrentItemToCart(): Promise<void> {
        const addToCartButton = $(PURCHASE_FLOW.ANDROID_SCROLL.toDescriptionContains('add product'));
        await addToCartButton.waitForDisplayed({ timeout: 5000 });
        await addToCartButton.click();
    }

    async openCart(): Promise<void> {
        await this.cartIcon.waitForDisplayed();
        await this.cartIcon.click();
    }

    async proceedToCheckout(): Promise<void> {
        await this.proceedToCheckoutButton.waitForDisplayed({ timeout: 5000 });
        await this.proceedToCheckoutButton.click();
    }

    private async setInputValue(element: ChainablePromiseElement, value: string): Promise<void> {
        await element.waitForDisplayed({ timeout: 10000 });
        await element.clearValue();
        await element.setValue(value);
    }

    private async hideKeyboardIfPossible(): Promise<void> {
        try {
            await driver.hideKeyboard();
        } catch {
            // Keyboard may already be hidden.
        }
    }

    private async isBillingAddressCheckboxSelected(): Promise<boolean> {
        await this.billingAddressCheckbox.waitForDisplayed({ timeout: 10000 });

        for (const attributeName of ['checked', 'selected', 'value']) {
            try {
                const attributeValue = await this.billingAddressCheckbox.getAttribute(attributeName);
                if (attributeValue && ['true', '1', 'checked', 'selected'].includes(attributeValue.toLowerCase())) {
                    return true;
                }
            } catch {
                // Ignore attribute lookup failures and keep probing.
            }
        }

        try {
            return await this.billingAddressCheckbox.isSelected();
        } catch {
            return false;
        }
    }

    async fillShippingAddress(data: ShippingDetails): Promise<void> {
        await this.setInputValue(this.shippingFullNameField, data.fullName);
        await this.setInputValue(this.shippingAddressLine1Field, data.addressLine1);
        await this.setInputValue(this.shippingAddressLine2Field, data.addressLine2);
        await this.setInputValue(this.shippingCityField, data.city);
        await this.setInputValue(this.shippingStateRegionField, data.stateRegion);
        await this.setInputValue(this.shippingZipCodeField, data.zipCode);
        await this.setInputValue(this.shippingCountryField, data.country);
        await this.hideKeyboardIfPossible();
    }

    async goToPayment(): Promise<void> {
        await this.toPaymentButton.waitForDisplayed();
        await this.toPaymentButton.click();
    }

    async fillPaymentDetails(data: PaymentDetails): Promise<void> {
        await this.setInputValue(this.paymentFullNameField, data.fullName);
        await this.setInputValue(this.paymentCardNumberField, data.cardNumber);
        await this.setInputValue(this.paymentExpirationDateField, data.expirationDate);
        await this.setInputValue(this.paymentSecurityCodeField, data.securityCode);
        await this.hideKeyboardIfPossible();
    }

    async ensureBillingAddressSameAsShippingSelected(): Promise<void> {
        if (!(await this.isBillingAddressCheckboxSelected())) {
            await this.billingAddressCheckbox.waitForDisplayed();
            await this.billingAddressCheckbox.click();
        }
    }

    async reviewOrder(): Promise<void> {
        await this.reviewOrderButton.waitForDisplayed();
        await this.reviewOrderButton.click();
    }

    async isReviewOrderPageLoaded(): Promise<boolean> {
        await this.reviewOrderAnchor.waitForDisplayed({ timeout: 10000 });
        return this.reviewOrderAnchor.isDisplayed();
    }

    async placeOrder(): Promise<void> {
        await this.placeOrderButton.waitForDisplayed();
        await this.placeOrderButton.click();
    }

    async waitForCheckoutCompletePage(): Promise<void> {
        await this.checkoutCompleteAnchor.waitForDisplayed({ timeout: 10000 });
    }

    async waitForContinueShoppingButton(): Promise<void> {
        await this.continueShoppingButton.waitForDisplayed({ timeout: 10000 });
    }

    async continueShopping(): Promise<void> {
        await this.continueShoppingButton.waitForDisplayed();
        await this.continueShoppingButton.click();
    }
}

export default new AndroidCatalogPage();
