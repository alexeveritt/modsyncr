
var _ = require('lodash');
var dependencies = require('./dependencies');
var options = require('./options');

var fastSync = require('./fast-sync');
var fullSync = require('./full-sync');

module.exports = {
    sync: syncLocalModules
};

function syncLocalModules(next) {

    // find all applications that rely on locally referenced modules
    dependencies.getDependencyDetails(function(err, data) {
        refreshLocalModules(data, function() {
            return next();
        });
    });
}

function refreshLocalModules(data, next) {
    var moduleCount = data.length;
    _.each(data, function(detail) {

        refreshModule(detail, function() {
            if (!--moduleCount) {
                return next();
            }
        });
    });
}

function refreshModule(detail, next) {
    if (options.mode === 'fast') {
        return fastSync(detail, next);
    }
    return fullSync(detail, next);
}
