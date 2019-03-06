'use strict';

const request = require('request'),
      log = require('../log'),
      Promise = require('bluebird');

class AppOptics {
    constructor() {
        this._url = 'https://api.appoptics.com/v1/measurements';
    }

    init(opt) {
        if (opt == null || !('token' in opt) || opt.token.length == 0) {
            let errorMsg = 'AppOptics: error token empty!';
            log.error(errorMsg);
            throw new Error('');
        }

        let buff = new Buffer(opt.token + ':');
        this._token = 'Basic ' + buff.toString('base64');
    }

    _collectValues(name, values) {
        let valuesMap = {};
        for (var index in values) {
            let value = values[index];
            let key = value[0] - value[0] % 60;
            if (key in valuesMap) {
                let valueObj = valuesMap[key];
                valueObj.count += 1;
                valueObj.sum += value[1];

                if (value[1] < valueObj.min) {
                    valueObj.min = value[1];
                }

                if (value[1] > valueObj.max) {
                    valueObj.max = value[1];
                }
            } else {
                // init value
                let valueObj = {
                    name: name,
                    period: 60,
                    time: key,
                    count: 1,
                    sum: value[1],
                    min: value[1],
                    max: value[1],
                    last: value[1],
                };
                valuesMap[key] = valueObj;
            }
        }

        return Array.from(Object.values(valuesMap));
    }

    send(name, values, tags) {
        if (tags == null || Object.keys(tags).length == 0) {
            tags = {
                general: "general"
            }
        }

        for (var key in tags) {
            let tag = tags[key];
            tags[key] = tag.replace(" ", "_");
        }

        let sendData = {
            tags: tags,
            measurements: this._collectValues(name, values)
        };

        let self = this;
        return new Promise(function (resolve, reject) {
            request.post({
                uri: self._url,
                json: sendData,
                timeout: self._timeout,
                headers: {
                    "Authorization": self._token,
                    "Content-Type": "application/json"
                }
            }, function (err, res, body) {
                if (err != null || (res != null && res.statusCode != 202)) {
                    log.error(err);
                    reject(err)
                } else {
                    resolve(body)
                }
            });
        });
    }
}

module.exports = AppOptics;