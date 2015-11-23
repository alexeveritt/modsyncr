var process = require('process');
var _ = require('lodash');
var packageFile = require('./package-file');
var glob = require('glob');
var path = require('path');
var setup = false;
var options = {mode: 'fast', src: process.cwd()};

module.exports = options;

readOptions();

function readOptions() {
    if (setup) {
        return;
    }
    setup = true;
    console.log('Reading options');

    applyOptions(getOptionsFromFileSync());
    applyOptions(getOptionsFromPackageFileSync());
    applyOptions(getOptionsFromCli());

    if (!_.isArray(options.ignore)) {
        options.ignore = [];
    }

    options.ignore.push('**/node_modules/**');
}

function applyOptions(opts) {
    if (typeof opts === 'undefined' || opts === null) {
        return;
    }
    var keys = _.keys(opts);
    _.forEach(keys, function(key) {
        options[key] = opts[key];
    });
}

function getOptionsFromCli() {
    if (process.argv.length > 2) {
        var params = _.slice(process.argv, 2);
        var opts = {};
        _.each(params, function(param, n) {
            if (_.startsWith(param, '-')) {

                var value = params[n + 1];

                if (typeof value === 'undefined' || _.startsWith(value, '-')) {
                    value = null;
                }

                if (value !== null && param === '-ignore') {
                    value = value.split(',');
                }

                opts[param.substr(1)] = value;
            }
        });
        return opts;
    }
    return null;
}

function getOptionsFromFileSync() {
    var files = glob.sync('**/modsyncr.rc', {ignore: ['**/node_modules/**'], cwd: path.join(__dirname, '../')});

    if (files.length > 0) {
        var rcFile = files[files.length - 1];

        var data = fs.readFileSync(rcFile, 'utf8');

        try {
            return JSON.parse(data);

        }
        catch (err) {
            console.log(err);

        }
    }
    return null;
}

function getOptionsFromPackageFileSync() {
    var packageFilename = path.join(__dirname, '../package.json');
    var data = packageFile.loadPackageFileSync(packageFilename);
    if (data.modsyncr && data.modsyncr.options) {
        return data.modsyncr.options;
    }
    return null;
}