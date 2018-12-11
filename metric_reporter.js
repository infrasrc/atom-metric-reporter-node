'use strict';

const log = require('./log'),
      drivers = require('./drivers/drivers'),
      Drivers = new drivers(),
      crypto = require('crypto'),
      Promise = require('bluebird');

class MetricReporter {
    constructor(driverName, interval, maxMetrics, prefix, isStub) {
        this._driver = Drivers.getDriver(driverName);
        if (this._driver != null) {
            let errMsg = 'Metric Reporter: error driver: ' + driverName + ' not found!';
            log.error(errMsg);
            throw new Error(errMsg);
        }

        // check types
        this._interval = interval;
        this._maxMetrics = maxMetrics;
        this._prefix = prefix;
        this._isStub = isStub;

        this._metrics = {};

        this._flushMetrics = false;
    }

    send(name, value, tags) {
        let self = this;
        return new Promise(function (resolve, reject) {

        });
    }

    stop() {
        let self = this;
        return new Promise(function (resolve, reject) {
            self._flushAll(false, metric).then(function (res) {
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
                startTime: moment().now()
            };

            self._metrics[hashKey] = metric;

            setInterval(function () {
                self._flush(true, metric);
            }, 1 * 60 * 1000); // 1 sec interval
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
            metric.startTime = moment().now();
            metric.points = [];
        };

        return new Promise(function (resolve, reject) {
            let currentTime = moment().now();

            let isNeedSend = (self._flushMetrics || (metric.points.length >= self._maxMetrics ||
                (currentTime.diff(metric.startTime).duration() >= self._interval)));

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