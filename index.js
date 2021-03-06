if (require('./lib/help')()) {
    return;
}

var syncr = require('./lib/syncr');
var setup = require('./lib/setup');

module.exports = function(done, opts) {
    setup.options(opts);
    return syncr.sync(done);
}