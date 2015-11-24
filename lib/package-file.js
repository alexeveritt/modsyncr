var fs = require('fs');
var _ = require('lodash');

module.exports = {
    loadPackageFile: loadPackageFile,
    loadPackageFileSync: loadPackageFileSync,
    removePackageVersion: removePackageVersion,
    hasSameDependencies: hasSameDependencies
};

function removePackageVersion(packageFilename, next) {
    loadPackageFile(packageFilename, function(err, data) {
        delete data.version;
        var jsonData = JSON.stringify(data, null, 2);
        fs.writeFile(packageFilename, jsonData, function() {
            return next();
        });
    });
}

function loadPackageFileSync(filename) {
    console.log('Reading package file "' + filename + '"');

    var data = fs.readFileSync(filename, 'utf8');
    try {
        return JSON.parse(data);
    }
    catch (err) {
        console.error(err);
        return null;
    }

}

function loadPackageFile(filename, next) {
    console.log('Reading package file "' + filename + '"');

    fs.readFile(filename, 'utf8', function(err, data) {
        if (err) {
            return next(err);
        }
        try {
            var packageData = JSON.parse(data);
            return next(null, packageData);
        }
        catch (err) {
            console.error(err);
            return next(err);
        }
    });
}

function hasSameDependencies(packageFile1, packageFile2) {
    // load data from both package files
    var packageData1 = loadPackageFileSync(packageFile1);
    var packageData2 = loadPackageFileSync(packageFile2);

    if (!compareDependencyList(packageData1.dependencies, packageData2.dependencies)) {
        return false;
    }

    return compareDependencyList(packageData1.devDependencies, packageData2.devDependencies);
}

function compareDependencyList(depList1, depList2) {

    // check if one of the dependency lists is missing / different to the other
    var pkg1UnDefined = _.isUndefined(depList1);
    var pkg2UnDefined = _.isUndefined(depList2);

    if (pkg1UnDefined !== pkg2UnDefined) {
        return false;
    }

    if (!pkg1UnDefined) {
        var keys1 = _.keys(depList1);
        var keys2 = _.keys(depList2);
        if (!_.isEqual(keys1.sort(), keys2.sort())) {
            return false;
        }

        _.forEach(keys1, function(key) {
            if (depList1[key] !== depList2[key]) {
                return false;
            }
        });
    }

    return true;
}
