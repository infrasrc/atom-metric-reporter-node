'use strict';



const MetricReporter = require('./metric_reporter');

class log2 {
    info(msg) {
        console.info(msg);
    }

    error(msg) {
        console.error(msg);
    }
}

function test_metrics() {
    let reporter = new MetricReporter("appoptics",
        {token: "cc709fde5c5d056e338c7450e2954702483b672e58915839f48abf5662c9e9a4"},
        2, 300, "", new log2());

    console.info("start test");
    for (var i = 0; i < 200; i++) {
        reporter.send("g8y3e_test_metric", Math.floor(Math.random() * Math.floor(10)), {
            "test": "test"
        });
    }

    setTimeout(function() {
        for (var i = 0; i < 200; i++) {
            reporter.send("g8y3e_test_metric", Math.floor(Math.random() * Math.floor(10)), {
                "test": "test"
            });
        }
    }, 3000);

    ['exit', 'SIGINT', 'SIGHUP', 'SIGQUIT', 'SIGABRT', 'SIGTERM'].map(function (event) {
        process.on(event, () => {
            console.info('SIGTERM signal received: ' + event);
            reporter.stop();
        });
    });

}

test_metrics();