var _ = require('lodash');
var dependencies = require('./dependencies');
var options = require('./options');

var fastSync = require('./fast-sync');
var fullSync = require('./full-sync');

module.exports = {
    sync: syncLocalModules
};

function syncLocalModules(next) {
    dependencies.getDependencyDetails(function(err, data) {
        var moduleCount = data.length;
        _.each(data, function(detail) {

            syncModule(detail, function() {
                if (!--moduleCount) {
                    console.info('Synchronised %s module(s)', data.length);
                    if (!_.isUndefined(next)) {
                        return next();
                    }
                }
            });
        });

    });
}

function syncModule(detail, next) {
    if (options.mode === 'fast') {
        return fastSync(detail, next);
    }
    return fullSync(detail, next);
}
