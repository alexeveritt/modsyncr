var process = require('process');
var _ = require('lodash');

module.exports = function() {

    if (showHelp()) {
        console.info();
        console.info('usage: [ -help | ? ] | [ -src -mode ]');
        console.info('-help     Display command line options');
        console.info('?         Display command line options');
        console.info('-src      Folder of project to sync');
        console.info('-mode:    Type of sync fast|full');
        return true;
    }
    return false;
};

function showHelp() {

    if (process.argv.length == 3) {
        var param = _.slice(process.argv, 2)[0];
        console.log(param);
        if (param === '-help' || param === '?') {
            return true;
        }
    }

    return false;
}