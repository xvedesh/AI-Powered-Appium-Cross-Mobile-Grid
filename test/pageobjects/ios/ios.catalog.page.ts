import { PURCHASE_FLOW } from '../../config/constants';
import { ICatalogPage, PaymentDetails, ShippingDetails } from '../CatalogPage';

class IOSCatalogPage implements ICatalogPage {
    private get catalogMenuItem() { return $(PURCHASE_FLOW.CATALOG_MENU_ITEM.ios); }
    private get backpackYellowItem() { return $(PURCHASE_FLOW.BACKPACK_YELLOW_ITEM.ios); }
    private get addToCartButton() { return $(PURCHASE_FLOW.ADD_TO_CART_BUTTON.ios); }
    private get cartIcon() { return $(PURCHASE_FLOW.CART_ICON.ios); }
    private get proceedToCheckoutButton() { return $(PURCHASE_FLOW.PROCEED_TO_CHECKOUT_BUTTON.ios); }
    private get shippingFullNameField() { return $(PURCHASE_FLOW.SHIPPING_FULL_NAME.ios); }
    private get shippingAddressLine1Field() { return $(PURCHASE_FLOW.SHIPPING_ADDRESS_LINE_1.ios); }
    private get shippingAddressLine2Field() { return $(PURCHASE_FLOW.SHIPPING_ADDRESS_LINE_2.ios); }
    private get shippingCityField() { return $(PURCHASE_FLOW.SHIPPING_CITY.ios); }
    private get shippingStateRegionField() { return $(PURCHASE_FLOW.SHIPPING_STATE_REGION.ios); }
    private get shippingZipCodeField() { return $(PURCHASE_FLOW.SHIPPING_ZIP_CODE.ios); }
    private get shippingCountryField() { return $(PURCHASE_FLOW.SHIPPING_COUNTRY.ios); }
    private get toPaymentButton() { return $(PURCHASE_FLOW.TO_PAYMENT_BUTTON.ios); }
    private get paymentFullNameField() { return $(PURCHASE_FLOW.PAYMENT_FULL_NAME.ios); }
    private get paymentCardNumberField() { return $(PURCHASE_FLOW.PAYMENT_CARD_NUMBER.ios); }
    private get paymentExpirationDateField() { return $(PURCHASE_FLOW.PAYMENT_EXPIRATION_DATE.ios); }
    private get paymentSecurityCodeField() { return $(PURCHASE_FLOW.PAYMENT_SECURITY_CODE.ios); }
    private get billingAddressCheckbox() { return $(PURCHASE_FLOW.BILLING_ADDRESS_CHECKBOX.ios); }
    private get reviewOrderButton() { return $(PURCHASE_FLOW.REVIEW_ORDER_BUTTON.ios); }
    private get reviewOrderAnchor() { return $(PURCHASE_FLOW.REVIEW_ORDER_PAGE_ANCHOR.ios); }
    private get placeOrderButton() { return $(PURCHASE_FLOW.PLACE_ORDER_BUTTON.ios); }
    private get checkoutCompleteAnchor() { return $(PURCHASE_FLOW.CHECKOUT_COMPLETE_PAGE_ANCHOR.ios); }
    private get continueShoppingButton() { return $(PURCHASE_FLOW.CONTINUE_SHOPPING_BUTTON.ios); }

    private async scrollToElement(element: ChainablePromiseElement): Promise<void> {
        try {
            await element.scrollIntoView();
        } catch {
            // Fall back to a straight wait when the driver can already resolve the element.
        }
    }

    private async clickElement(element: ChainablePromiseElement): Promise<void> {
        await this.scrollToElement(element);
        await element.waitForDisplayed({ timeout: 10000 });
        await element.click();
    }

    private async setInputValue(element: ChainablePromiseElement, value: string): Promise<void> {
        await this.scrollToElement(element);
        await element.waitForDisplayed({ timeout: 10000 });
        await element.clearValue();
        await element.setValue(value);
    }

    private async hideKeyboardIfPossible(): Promise<void> {
        try {
            await driver.hideKeyboard();
        } catch {
            try {
                await driver.keys(['Return']);
            } catch {
                // Keyboard may already be hidden.
            }
        }
    }

    private async isBillingAddressCheckboxSelected(): Promise<boolean> {
        await this.scrollToElement(this.billingAddressCheckbox);
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

    async selectCatalogMenuItem(): Promise<void> {
        await this.clickElement(this.catalogMenuItem);
    }

    async selectBackpackYellowItem(): Promise<void> {
        await this.clickElement(this.backpackYellowItem);
    }

    async addCurrentItemToCart(): Promise<void> {
        await this.clickElement(this.addToCartButton);
    }

    async openCart(): Promise<void> {
        await this.clickElement(this.cartIcon);
    }

    async proceedToCheckout(): Promise<void> {
        await this.clickElement(this.proceedToCheckoutButton);
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
        await this.clickElement(this.toPaymentButton);
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
            await this.clickElement(this.billingAddressCheckbox);
        }
    }

    async reviewOrder(): Promise<void> {
        await this.clickElement(this.reviewOrderButton);
    }

    async isReviewOrderPageLoaded(): Promise<boolean> {
        await this.scrollToElement(this.reviewOrderAnchor);
        await this.reviewOrderAnchor.waitForDisplayed({ timeout: 10000 });
        return this.reviewOrderAnchor.isDisplayed();
    }

    async placeOrder(): Promise<void> {
        await this.clickElement(this.placeOrderButton);
    }

    async isCheckoutCompletePageLoaded(): Promise<boolean> {
        await this.checkoutCompleteAnchor.waitForDisplayed({ timeout: 10000 });
        return this.checkoutCompleteAnchor.isDisplayed();
    }

    async isContinueShoppingButtonClickable(): Promise<boolean> {
        await this.continueShoppingButton.waitForDisplayed({ timeout: 10000 });
        return this.continueShoppingButton.isClickable();
    }

    async continueShopping(): Promise<void> {
        await this.clickElement(this.continueShoppingButton);
    }
}

export default new IOSCatalogPage();
