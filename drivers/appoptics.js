'use strict';

class AppOptics {
    constructor(token) {
        if (token.length == 0) {
            let errorMsg = 'AppOptics: error token empty!';
            log.error(errorMsg);
            throw new Error('');
        }

        this._url = 'https://api.appoptics.com/v1/measurements';
        this._token = 'Basic ' + token + ':';
    }

    send() {

    }
}

module.exports = AppOptics;