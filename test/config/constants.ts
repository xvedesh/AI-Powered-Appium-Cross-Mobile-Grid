export const HOME_SCREEN = {
    PRODUCT_LABEL: {
        android: 'android=new UiSelector().text("Products")',
        ios: '-ios predicate string:name == "Products"', // Исправлено под твой скриншот
        web: '.title' 
    },
    MORE_TAB: {
        ios: '-ios predicate string:name == "More"',
        android: '~More',
        web: '#more'
    }
}

export const MENU_SCREEN = {
    LOGIN_ITEM: {
        ios: '-ios predicate string:name == "LogOut-menu-item"',
        android: '~Login',
        web: '//a[text()="Login"]'
    }
}

export const LOGIN_SCREEN = {
    USERNAME: {
        ios: '-ios predicate string:type == "XCUIElementTypeTextField" AND name == "Username"',
        android: '~Username',
        web: '#user-name'
    },
    PASSWORD: {
        ios: '-ios predicate string:type == "XCUIElementTypeSecureTextField"',
        android: '~Password',
        web: '#password'
    },
    LOGIN_BTN: {
        ios: '-ios predicate string:name == "Login" AND label == "Login" AND type == "XCUIElementTypeButton"',
        android: '~Login',
        web: '#login-button'
    }
}