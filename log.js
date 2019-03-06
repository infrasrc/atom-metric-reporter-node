function info(message) {
    console.info(message);
}

function error(message) {
    console.error(message);
}

module.exports.info = info;
module.exports.error = error;