'use strict';



const MetricReporter = require('./metric_reporter');

function test_metrics() {
    let reporter = new MetricReporter("appoptics",
        {token: "28391cb3284131d319341cc02a742bbd9ae4f915d7ac6e813a0b5623cdaeac05"}, 2);

    for (var i = 0; i < 200; i++) {
        reporter.send("g8y3e_test_metric", Math.floor(Math.random() * Math.floor(10)), {
            "test": "test"
        });
    }

    console.info("test")

}

test_metrics();