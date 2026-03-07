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
