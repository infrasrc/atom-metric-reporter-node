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
        {token: "test"},
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