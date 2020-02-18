/* eslint-disable no-magic-numbers */
const request = require('sync-request');
const qs = require('querystring');
const wait = require('asyncawait/await');

// We have outdated certs in our staging environment. This allows us to access the staging keycloak admin.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

/**
 *  KeyCloakAdmin contains a set of functions that use the admin service to generate and manipulate test data
 *  (NOTE: Used for Staging environment ONLY)
 */
class KeyCloakAdmin {
    constructor() {
        this.accessCode = this.generateAccessToken();
    }

    /**
     * Generates an access token in order to access the Keycloak admin
     * @return access_token
     */
    generateAccessToken() {
        let token;
        const requestBodyMap = `username=${process.env.RHD_KEYCLOAK_ADMIN_USERNAME}&grant_type=password&client_id=admin-cli&password=${process.env.RHD_KEYCLOAK_ADMIN_PASSWORD}`;
        const requestHeader = {"content-type": "application/x-www-form-urlencoded"};
        const endpoint = 'https://developers.stage.redhat.com/auth/realms/master/protocol/openid-connect/token';
        try {
            const response = request('POST', endpoint, {headers: requestHeader, body: requestBodyMap, agent: false});
            token = JSON.parse(response.getBody().toString('utf8'));
            return token.access_token;
        } catch (e) {
            throw new Error(`failed to generate access token for keycloak admin. Error was ${e}`);
        }
    }

    /**
     * Registers new RHD site user
     * @param user: Hash of customer credentials
     */
    registerNewUser(user) {
        const url = 'https://developers.stage.redhat.com/auth/admin/realms/rhd/users';
        try {
            return wait(request('POST', url, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.accessCode}`,
                },
                json: {
                    "enabled": true,
                    "attributes": {
                        'company': [user.company],
                        'phoneNumber': [user.phoneNumber],
                        'country': [user.country],
                        'addressLine1': [user.addressLineOne],
                        'addressCity': [user.city],
                        'addressState': [user.state],
                        'addressPostalCode': [user.postalCode],
                        'pwd': [user.password],
                        'tcacc-1246': ['y'],
                        'tcacc-1010': ['y'],
                        'tcacc-6': ['y'],
                        'newsletter': ['y'],
                        'rhdSubscrValid': true,
                    },
                    "requiredActions": [],
                    "username": user.username,
                    "email": user.email,
                    "emailVerified": true,
                    "firstName": user.firstName,
                    "lastName": user.lastName,
                },
                agent: false,
            }));
        } catch (e) {
            return new Error(`failed to register new user via keycloak admin. Error was ${e}`);
        }
    }

    /**
     * Searches admin by registered email address
     * @param  email       email that you wish to search for
     * @return user registered rhdAccountDetails
     */
    getUserBy(email) {
        const encodedEmail = qs.escape(email);
        const url = `https://developers.stage.redhat.com/auth/admin/realms/rhd/users?email=${encodedEmail}`;
        try {
            const res = wait(request('GET', url, {
                headers: {"Authorization": `Bearer ${this.accessCode}`},
                agent: false,
            }));
            return JSON.parse(res.getBody().toString('utf8'));
        } catch (e) {
            return new Error(`failed to find user with email ${email}. Error was ${e}`);
        }
    }

    /**
     * Get's user registered attributes, such as date of registration date,
     * rhd registered subscriptions etc
     * @param  email       email that you wish to search for
     * @param  attribute   attribute rhdAccountDetails you wish to get, for example rhdTacSignDateFormatted, or rhdSubscrValid
     * @return user specified attribute assigned
     */
    getUserAttribute(email, attribute) {
        const data = this.getUserBy(email);
        return data[0].attributes[attribute][0];
    }

    /**
     * Get's user registered social account logins
     * @param  email       email that you wish to search for
     * @return user assigned social account(s)
     */
    getSocialLogins(email) {
        const user = this.getUserBy(email);
        const userId = user[0].id;
        const url = `https://developers.stage.redhat.com/auth/admin/realms/rhd/users/${userId}/federated-identity`;
        try {
            const res = wait(request('GET', url, {
                headers: {
                    "Authorization": `Bearer ${this.accessCode}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                agent: false,
            }));
            return JSON.parse(res.getBody().toString('utf8'));
        } catch (e) {
            return new Error(`failed to get social logins for user  with email ${email}. Error was ${e}`);
        }
    }

    /**
     * Link a social account to an RHD registered account
     * @param  email              email that you wish to search for
     * @param  identityProvider   social media provider
     * @param  userId             User id of social provider
     * @param  userName           Username of social provider
     */
    linkSocialProvider(email, identityProvider, userId, userName) {
        // let accessCode = this.generateAccessToken();
        const user = this.getUserBy(email);
        const rhdUserId = user[0].id;
        const url = `https://developers.stage.redhat.com/auth/admin/realms/rhd/users/${rhdUserId}/federated-identity/${identityProvider}`;

        try {
            return wait(request('POST', url, {
                headers: {
                    "Authorization": `Bearer ${this.accessCode}`,
                    "Content-Type": "application/json",
                },
                json: {
                    "identityProvider": identityProvider,
                    "userId": userId,
                    "userName": userName,
                },
                agent: false,
            }));
        } catch (e) {
            return new Error(`failed to link social provider to user with email ${email}. Error was ${e}`);
        }
    }


    /**
     * Unlinks a assigned social account
     * @param  email              email that you wish to search for
     */
    unlinkSocialProvider(email) {
        // let accessCode = this.generateAccessToken();
        const user = this.getUserBy(email);
        const rhdUserId = user[0].id;
        const userSocialLogins = this.getSocialLogins(email);
        const identityProvider = userSocialLogins[0].identityProvider;
        const url = `https://developers.stage.redhat.com/auth/admin/realms/rhd/users/${rhdUserId}/federated-identity/${identityProvider}`;
        try {
            wait(request('DELETE', url, {headers: {"Authorization": `Bearer ${this.accessCode}`}, agent: false}));
        } catch (e) {
            return new Error(`failed to unlink social provider with email: ${email}. Error was ${e}`);
        }
    }

    /**
     * Deletes RHD registered account
     * @param  email   email that you wish to search for
     * NOTE: It is imposible to completely delete an account from the KeyCloak DB
     * therefore a previously deleted email cannot be used to register a new account
     */
    deleteUser(email) {
        // let accessCode = this.generateAccessToken();
        const user = this.getUserBy(email);
        const userId = user[0].id;
        const url = `https://developers.stage.redhat.com/auth/admin/realms/rhd/users/${userId}`;
        wait(request('DELETE', url, {headers: {"Authorization": `Bearer ${this.accessCode}`}, agent: false}));
        // eslint-disable-next-line no-undef
        return new Error(`failed to delete user with email: ${email}. Error was ${e}`);
    }
}

module.exports = KeyCloakAdmin;
