'use strict';

const log = require('./log'),
      drivers = require('./drivers/drivers'),
      Drivers = new drivers(),
      Promise = require('bluebird');

class MetricReporter {
    constructor(driverName, interval, maxMetrics, isStub) {
        this._driver = Drivers.getDriver(driverName);
        if (this._driver != null) {
            let errMsg = 'Metric Reporter: error driver: ' + driverName + ' not found!';
            log.error(errMsg);
            throw new Error(errMsg);
        }

        // check types
        this._interval = interval;
        this._maxMetrics = maxMetrics;
        this._isStub = isStub;
    }

    send(name, value, tags) {
        let self = this;
        return new Promise(function (resolve, reject) {

        });
    }
}

module.exports = MetricReporter;