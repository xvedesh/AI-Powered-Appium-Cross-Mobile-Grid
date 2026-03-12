import 'dotenv/config';
import { faker } from '@faker-js/faker';

// Determine if we are running Web or Mobile
const platform = process.env.PLATFORM ?? '';
const isMobile = platform.startsWith('ios') || platform.startsWith('android');

export const USERS = {
    SUCCESS: {
        user: isMobile ? process.env.MOBILE_USER : process.env.WEB_USER,
        pass: isMobile ? process.env.MOBILE_PASS : process.env.WEB_PASS
    },
    LOCKED: {
        user: isMobile ? process.env.MOBILE_LOCKED_USER : process.env.WEB_LOCKED_USER,
        pass: isMobile ? process.env.MOBILE_PASS : process.env.WEB_PASS,
        error: 'Sorry, this user has been locked out.'
    },
    INVALID: {
        get user() { return faker.internet.email(); },
        get pass() { return faker.internet.password(); },
        error: 'Provided credentials do not match any user in this service.'
    },
    EMPTY: {
        user: '',
        pass: '',
        error: 'Username is required'
    }
};
