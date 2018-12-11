'use strict';

const log = require('../log');

class Datadog {
    constructor(apiKey) {
        if (apiKey.length == 0) {
            let errorMsg = 'Datadog: error apiKey empty!';
            log.error(errorMsg);
            throw new Error('');
        }

        this._url = "https://app.datadoghq.com/api/v1/series?api_key=" + apiKey;
    }

    _jsonify() {

    }

    send() {
    }
}

module.exports = AppOptics;