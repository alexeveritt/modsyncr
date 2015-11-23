var path = require('path');
var _ = require('lodash');
var glob = require('glob');
var options = require('./options');
var process = require('process');
var packageFile = require('./package-file');

const FILE_REF_PREFIX = 'file:';

module.exports = {
    getDependencyDetails: getDependencyDetails,
};

function getDependencyDetails(next) {

    var opts = {};
    opts.ignore = options.ignore;
    opts.cwd = options.src;
    var cwd = process.cwd();
    process.chdir(opts.cwd);
    glob('**/package.json', opts, function findPackageFilesCallback(err, files) {
        if (err || files.length === 0) {
            process.chdir(cwd);
            return next(null, null);
        }

        _.forEach(files, function(f, n) {
            files[n] = path.join(options.src, f);
        });

        parsePackageFiles(files, function(err, nodeModuleDetails) {
            process.chdir(cwd);
            return next(null, nodeModuleDetails);
        });
    })

    console.log('Looking for local modules in "' + options.src + '"');
}

function parsePackageFiles(files, next) {
    var nodeModuleDetails = [];
    var itemsRemaining = files.length;

    _.each(files, function(packageFile) {
        getFileDependencies(packageFile, function(err, data) {
            if (data != null) {
                _.merge(nodeModuleDetails, data);
            }
            if (!--itemsRemaining) {
                return next(null, nodeModuleDetails);
            }
        });
    });
}

function getFileDependencies(packageFilename, next) {

    packageFile.loadPackageFile(packageFilename, function(err, data) {
        getFileDependency(packageFilename, data, next)
    });

}

function getFileDependency(packageFilename, data, next) {
    var dependencies = data.dependencies || {};
    var devDependencies = data.devDependencies || {};
    var nodeModuleDetails = [];
    var deps = _.merge(dependencies, devDependencies);
    var propKeys = _.keys(deps);

    // check to see if there are any dependencies in the package file
    if (!propKeys.length) {
        return next(null, null);
    }

    // remove any dependencies that are not locally referenced
    // e.g. "someapp":"file:../someapp"
    var localFileRefs = _.filter(propKeys, function(key) {
        return deps[key].substr(0, FILE_REF_PREFIX.length) === FILE_REF_PREFIX;
    });

    // this is a list of all the locally referenced dependencies in the package file
    // add some additional data for the module syncr to work with them
    _.each(localFileRefs, function(key) {
        var dep = deps[key];
        var localModule = {};
        localModule.name = key;
        localModule.location = dep.substr(FILE_REF_PREFIX.length)
        localModule.packageDirectory = path.dirname(packageFilename);
        localModule.nodeModulesDirectory = path.join(localModule.packageDirectory, 'node_modules');
        nodeModuleDetails.push(localModule);
    });

    return next(null, nodeModuleDetails);
}
