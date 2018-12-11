'use strict';

const request = require('request'),
      Promise = require('bluebird');

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

    send(name, value, tags) {
        let sendData = {
            tags: {},
            measurements: [
                {
                    name: name,
                    time: '',
                    period: '',
                    sum: 0,
                    count: 0,
                    min: 0,
                    max: 0,
                    last:'',
                }
            ]
        };

        let self = this;
        return new Promise(function (resolve, reject) {
            request.post(self._url, {
                json: sendData,
                timeout: self._timeout
            }, function (err, res, body) {

            });
        });
    }
}

module.exports = AppOptics;