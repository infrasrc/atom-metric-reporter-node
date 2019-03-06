'use strict';

const log = require('./log'),
      drivers = require('./drivers/drivers'),
      Drivers = new drivers(),
      crypto = require('crypto'),
      moment = require('moment'),
      Promise = require('bluebird');

class MetricReporter {
    constructor(driverName, driverOptions, interval, maxMetrics, prefix, isStub) {
        // init driver
        driverName = driverName || "";
        this._driver = Drivers.getDriver(driverName);
        if (this._driver == null) {
            let errMsg = 'Metric Reporter: error driver: ' + driverName + ' not found!';
            log.error(errMsg);
            throw new Error(errMsg);
        }
        this._driver.init(driverOptions);

        // check types
        this._interval = interval || 1;
        this._maxMetrics = maxMetrics || 100;
        this._prefix = prefix || "";
        this._isStub = isStub || false;

        this._metrics = {};

        this._flushMetrics = false;
    }

    send(name, value, tags) {
        let self = this;
        return new Promise(function (resolve, reject) {
            self._safeMetric(name, value, tags);
            resolve(true);
        });
    }

    stop() {
        let self = this;
        return new Promise(function (resolve, reject) {
            self._flushAll(metric).then(function (res) {
                resolve(res);
            }, function (reason) {
                reject(reason);
            })
        });
    }

    _safeMetric(name, value, tags) {
        let self = this;
        let hashKey = self._calcHash(name, tags);

        if (hashKey in self._metrics) {
            let metric = self._metrics[hashKey];

            metric.points.push([moment().unix(), value]);
        } else {
            let metric = {
                name: name,
                points: [],
                tags: tags,
                startTime: moment()
            };

            metric.points.push([moment().unix(), value]);
            self._metrics[hashKey] = metric;

            setInterval(function () {
                self._flush(metric);
            }, self._interval * 1000);
        }
    }

    _calcHash(name, tags) {
        let hashData = this._prefix + '.' + name;

        let hashList = [];
        for (var key in tags) {
            let tag = tags[key];

            hashList.push(key);
            hashList.push(tag);
        }
        hashList = hashList.sort();

        for (var index in hashList) {
            hashData += hashList[index];
        }

        return crypto.createHash('md5').update(hashData).digest('hex')
    }

    _flush(metric) {
        let self = this;
        let metricClear = function() {
            metric.startTime = moment();
            metric.points = [];
        };

        return new Promise(function (resolve, reject) {
            let currentTime = moment();

            let isNeedSend = (self._flushMetrics || (metric.points.length != 0 &&
                (metric.points.length >= self._maxMetrics)));

            if (isNeedSend) {
                self._driver.send(metric.name, metric.points, metric.tags).then(function (res) {
                    metricClear();
                    resolve(res);
                }, function (reason) {
                    metricClear();
                    reject(reason);
                });
            }
        })
    }

    _flushAll() {
        let self = this;
        return new Promise(function (resolve, reject) {
            let metricCount = Object.keys(self._metrics).length;
            self._flushMetrics = true;

            var intervalCount = 0;
            var maxIntervalCount = 1000;

            var flushInterval = setInterval(function() {
                var currentCount = 0;
                intervalCount += 1;

                if (intervalCount >= maxIntervalCount) {
                    let errorStr = 'Metric Reporter: error flush all data!';
                    log.error(errorStr);
                    reject(errorStr);
                }

                for (var key in self._metrics) {
                    let metric = self._metrics[key];

                    if (metric.points.length == 0) {
                        currentCount += 1;
                    }

                    if (currentCount >= metricCount) {
                        resolve('Flushed metrics');
                    }
                }
            }, 30 * 1000);
        });
    }
}

module.exports = MetricReporter;