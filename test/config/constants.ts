export const HOME_SCREEN = {
    CATALOG_SCREEN: {
        android: '~Container for fragments',
        ios: '~Catalog-screen',
        web: ''
    },
    PRODUCT_LABEL: {
        android: 'android=new UiSelector().description("test-PRODUCTS")',
        ios: '-ios predicate string:name == "Products"',
        web: '.title' 
    },
    HAMBURGER_MENU: {
        ios: '-ios predicate string:name == "More-tab-item" AND visible == 1',
        android: 'id=com.saucelabs.mydemoapp.android:id/menuIV',
        web: '#more'
    }
}

export const MENU_SCREEN = {
    LOGIN_ITEM: {
        ios: '~Login Button',
        android: '~Login Menu Item',
        web: '//a[text()="Login"]'
    }
}

export const LOGIN_SCREEN = {
    USERNAME: {
        ios: '-ios predicate string:type == "XCUIElementTypeTextField"',
        android: 'android=new UiSelector().description("test-Username")',
        web: '#user-name'
    },
    PASSWORD: {
        ios: '-ios predicate string:type == "XCUIElementTypeSecureTextField"',
        android: 'android=new UiSelector().description("test-Password")',
        web: '#password'
    },
    LOGIN_BTN: {
        ios: '-ios predicate string:type == "XCUIElementTypeButton" AND name == "Login"',
        android: 'id=com.saucelabs.mydemoapp.android:id/loginBtn',
        web: '#login-button'
    },
    USERNAME_LINK: {
        ios: '~bob@example.com',
        android: 'id=com.saucelabs.mydemoapp.android:id/username1TV',
        web: ''
    }
}

export const PURCHASE_FLOW = {
    CATALOG_MENU_ITEM: {
        ios: '~Catalog Menu Item',
        android: '~Catalog Menu Item',
        web: '//a[normalize-space()="Catalog"] | //button[normalize-space()="Catalog"]'
    },
    BACKPACK_YELLOW_ITEM: {
        ios: '-ios predicate string:name CONTAINS "Sauce Labs Backpack" AND name CONTAINS "(yellow)"',
        android: 'android=new UiSelector().textContains("Sauce Labs Backpack (yellow)")',
        web: '//*[self::a or self::button or self::div or self::span or self::p][contains(normalize-space(),"Sauce Labs Backpack") and contains(normalize-space(),"(yellow)")]'
    },
    ADD_TO_CART_BUTTON: {
        ios: '-ios predicate string:type == "XCUIElementTypeButton" AND (name == "Add To Cart" OR label == "Add To Cart")',
        android: '//android.widget.Button[@text="Add To Cart" or @content-desc="Add To Cart button"]',
        web: '//button[normalize-space()="Add To Cart" or normalize-space()="Add to Cart"]'
    },
    CART_ICON: {
        ios: '-ios predicate string:name CONTAINS[c] "cart" OR label CONTAINS[c] "cart"',
        android: '//*[@resource-id="com.saucelabs.mydemoapp.android:id/cartIV" or contains(@content-desc,"cart") or contains(@content-desc,"Cart")]',
        web: '//*[@id="cart" or @aria-label="cart" or @data-test="shopping-cart-link" or contains(@href,"cart")]'
    },
    PROCEED_TO_CHECKOUT_BUTTON: {
        ios: '-ios predicate string:type == "XCUIElementTypeButton" AND (name == "Proceed To Checkout" OR label == "Proceed To Checkout")',
        android: '//android.widget.Button[@text="Proceed To Checkout" or @content-desc="Proceed To Checkout button"]',
        web: '//button[normalize-space()="Proceed To Checkout" or normalize-space()="Proceed to Checkout"]'
    },
    SHIPPING_FULL_NAME: {
        ios: '//XCUIElementTypeStaticText[contains(@name,"Full Name")]/following-sibling::XCUIElementTypeTextField[1]',
        android: '//android.widget.TextView[contains(@text,"Full Name")]/following-sibling::android.widget.EditText[1]',
        web: '//label[contains(normalize-space(),"Full Name")]/following::*[self::input or self::textarea][1]'
    },
    SHIPPING_ADDRESS_LINE_1: {
        ios: '//XCUIElementTypeStaticText[contains(@name,"Address Line 1")]/following-sibling::XCUIElementTypeTextField[1]',
        android: '//android.widget.TextView[contains(@text,"Address Line 1")]/following-sibling::android.widget.EditText[1]',
        web: '//label[contains(normalize-space(),"Address Line 1")]/following::*[self::input or self::textarea][1]'
    },
    SHIPPING_ADDRESS_LINE_2: {
        ios: '//XCUIElementTypeStaticText[contains(@name,"Address Line 2")]/following-sibling::XCUIElementTypeTextField[1]',
        android: '//android.widget.TextView[contains(@text,"Address Line 2")]/following-sibling::android.widget.EditText[1]',
        web: '//label[contains(normalize-space(),"Address Line 2")]/following::*[self::input or self::textarea][1]'
    },
    SHIPPING_CITY: {
        ios: '//XCUIElementTypeStaticText[contains(@name,"City")]/following-sibling::XCUIElementTypeTextField[1]',
        android: '//android.widget.TextView[contains(@text,"City")]/following-sibling::android.widget.EditText[1]',
        web: '//label[contains(normalize-space(),"City")]/following::*[self::input or self::textarea][1]'
    },
    SHIPPING_STATE_REGION: {
        ios: '//XCUIElementTypeStaticText[contains(@name,"State/Region")]/following-sibling::XCUIElementTypeTextField[1]',
        android: '//android.widget.TextView[contains(@text,"State/Region")]/following-sibling::android.widget.EditText[1]',
        web: '//label[contains(normalize-space(),"State/Region")]/following::*[self::input or self::textarea][1]'
    },
    SHIPPING_ZIP_CODE: {
        ios: '//XCUIElementTypeStaticText[contains(@name,"Zip Code")]/following-sibling::XCUIElementTypeTextField[1]',
        android: '//android.widget.TextView[contains(@text,"Zip Code")]/following-sibling::android.widget.EditText[1]',
        web: '//label[contains(normalize-space(),"Zip Code")]/following::*[self::input or self::textarea][1]'
    },
    SHIPPING_COUNTRY: {
        ios: '//XCUIElementTypeStaticText[contains(@name,"Country")]/following-sibling::XCUIElementTypeTextField[1]',
        android: '//android.widget.TextView[contains(@text,"Country")]/following-sibling::android.widget.EditText[1]',
        web: '//label[contains(normalize-space(),"Country")]/following::*[self::input or self::textarea][1]'
    },
    TO_PAYMENT_BUTTON: {
        ios: '-ios predicate string:type == "XCUIElementTypeButton" AND (name == "To Payment" OR label == "To Payment")',
        android: '//android.widget.Button[@text="To Payment" or @content-desc="To Payment button"]',
        web: '//button[normalize-space()="To Payment"]'
    },
    PAYMENT_FULL_NAME: {
        ios: '(//XCUIElementTypeStaticText[contains(@name,"Full Name")]/following-sibling::XCUIElementTypeTextField)[last()]',
        android: '(//android.widget.TextView[contains(@text,"Full Name")]/following-sibling::android.widget.EditText)[last()]',
        web: '(//label[contains(normalize-space(),"Full Name")]/following::*[self::input or self::textarea][1])[last()]'
    },
    PAYMENT_CARD_NUMBER: {
        ios: '//XCUIElementTypeStaticText[contains(@name,"Card Number")]/following-sibling::XCUIElementTypeTextField[1]',
        android: '//android.widget.TextView[contains(@text,"Card Number")]/following-sibling::android.widget.EditText[1]',
        web: '//label[contains(normalize-space(),"Card Number")]/following::*[self::input or self::textarea][1]'
    },
    PAYMENT_EXPIRATION_DATE: {
        ios: '//XCUIElementTypeStaticText[contains(@name,"Expiration Date")]/following-sibling::XCUIElementTypeTextField[1]',
        android: '//android.widget.TextView[contains(@text,"Expiration Date")]/following-sibling::android.widget.EditText[1]',
        web: '//label[contains(normalize-space(),"Expiration Date")]/following::*[self::input or self::textarea][1]'
    },
    PAYMENT_SECURITY_CODE: {
        ios: '//XCUIElementTypeStaticText[contains(@name,"Security Code")]/following-sibling::XCUIElementTypeTextField[1]',
        android: '//android.widget.TextView[contains(@text,"Security Code")]/following-sibling::android.widget.EditText[1]',
        web: '//label[contains(normalize-space(),"Security Code")]/following::*[self::input or self::textarea][1]'
    },
    BILLING_ADDRESS_CHECKBOX: {
        ios: '//XCUIElementTypeSwitch[1] | //XCUIElementTypeButton[contains(@name,"billing address")] | //XCUIElementTypeOther[contains(@name,"billing address")]',
        android: '//android.widget.CheckBox[1] | //android.widget.TextView[contains(@text,"My billing address is the same as my shipping address")]/preceding-sibling::*[1]',
        web: '//input[@type="checkbox" and (contains(@id,"billing") or contains(@name,"billing"))] | //label[contains(normalize-space(),"My billing address is the same as my shipping address")]/preceding::input[@type="checkbox"][1]'
    },
    REVIEW_ORDER_BUTTON: {
        ios: '-ios predicate string:type == "XCUIElementTypeButton" AND (name == "Review Order" OR label == "Review Order")',
        android: '//android.widget.Button[@text="Review Order" or @content-desc="Review Order button"]',
        web: '//button[normalize-space()="Review Order"]'
    },
    REVIEW_ORDER_PAGE_ANCHOR: {
        ios: '-ios predicate string:name CONTAINS "Review your order"',
        android: '//android.widget.TextView[contains(@text,"Review your order")]',
        web: '//*[contains(normalize-space(),"Review your order")]'
    },
    PLACE_ORDER_BUTTON: {
        ios: '-ios predicate string:type == "XCUIElementTypeButton" AND (name == "Place Order" OR label == "Place Order")',
        android: '//android.widget.Button[@text="Place Order" or @content-desc="Place Order button"]',
        web: '//button[normalize-space()="Place Order"]'
    },
    CHECKOUT_COMPLETE_PAGE_ANCHOR: {
        ios: '-ios predicate string:name CONTAINS "Checkout Complete" OR name CONTAINS "Thank you for your order"',
        android: '//*[contains(@text,"Checkout Complete") or contains(@text,"Thank you for your order")]',
        web: '//*[contains(normalize-space(),"Checkout Complete") or contains(normalize-space(),"Thank you for your order")]'
    },
    CONTINUE_SHOPPING_BUTTON: {
        ios: '-ios predicate string:type == "XCUIElementTypeButton" AND (name == "Continue Shopping" OR label == "Continue Shopping")',
        android: '//android.widget.Button[@text="Continue Shopping" or @content-desc="Continue Shopping button"]',
        web: '//button[normalize-space()="Continue Shopping"]'
    }
}
