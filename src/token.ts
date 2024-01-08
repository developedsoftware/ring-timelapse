#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logRefreshToken = exports.acquireRefreshToken = void 0;
const rest_client_1 = require("../node_modules/ring-client-api/lib/api/rest-client");
const util_1 = require("../node_modules/ring-client-api/lib/api/");
const fs = require('fs');
async function acquireRefreshToken() {
    const email = await (0, util_1.requestInput)('Email: '), password = await (0, util_1.requestInput)('Password: '), restClient = new rest_client_1.RingRestClient({ email, password }), getAuthWith2fa = async () => {
        const code = await (0, util_1.requestInput)('2FA Code: ');
        try {
            return await restClient.getAuth(code);
        }
        catch (_) {
            console.log('Incorrect code. Please try again.');
            return getAuthWith2fa();
        }
    }, auth = await restClient.getCurrentAuth().catch((e) => {
        if (restClient.promptFor2fa) {
            console.log(restClient.promptFor2fa);
            return getAuthWith2fa();
        }
        console.error(e);
        process.exit(1);
    });
    return auth.refresh_token;
}
exports.acquireRefreshToken = acquireRefreshToken;
async function logRefreshToken() {
    const refreshToken = await acquireRefreshToken();
    try {
        fs.writeFileSync('/app/dist/target/.token', refreshToken);
        console.log('\nSuccessfully generated a refresh token. You can now run ring-timelapse:snapshot\n');
    } catch (err) {
        console.error(err);
    }
}
exports.logRefreshToken = logRefreshToken;
process.on('unhandledRejection', () => { });
logRefreshToken();