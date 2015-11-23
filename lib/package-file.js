var fs = require('fs');

module.exports = {
    loadPackageFile: loadPackageFile,
    loadPackageFileSync: loadPackageFileSync,
    removePackageVersion: removePackageVersion
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
        console.log(filename);
        return JSON.parse(data);
    }
    catch (err) {
        console.log(err);
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
            console.log(filename);
            var packageData = JSON.parse(data);
            return next(null, packageData);
        }
        catch (err) {
            console.log(err);
            return next(err);
        }
    });
}