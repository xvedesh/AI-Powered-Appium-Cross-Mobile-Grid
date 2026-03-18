export const CHECKOUT_DATA = {
    productName: 'Sauce Labs Backpack (yellow)',
    shipping: {
        fullName: 'Rebecca Winter',
        addressLine1: 'Mandorley 112',
        addressLine2: 'Entrance 1',
        city: 'Truro',
        stateRegion: 'Cornwall',
        zipCode: '89750',
        country: 'United Kingdom'
    },
    payment: {
        fullName: 'Rebecca Winter',
        cardNumber: '3258 1256 7568 7891',
        expirationDate: '03/25',
        securityCode: '123'
    }
} as const;
