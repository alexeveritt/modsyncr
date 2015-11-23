var checksum = require('checksum');
var fullSync = require('./full-sync');
var path = require('path');

var _ = require('lodash');

module.exports = function(detail, next) {
    // compare the package files for shared and if changed then for update

    var tgtApp = path.join(detail.nodeModulesDirectory, detail.name);
    var tgtAppPackageFile = path.join(tgtApp, 'package.json');
    var srcApp = detail.location;
    var srcAppPackageFile = path.join(srcApp, 'package.json');

    compareFiles(tgtAppPackageFile, srcAppPackageFile, function(err, theSame) {
        if (!theSame) {
            // the package files have changed so don't mess around
            return fullSync(detail, next);
        }
        else {
            // glob all the files -- not hte node modules
            glob('**/*', {ignore: ['**/node_modules/**'], cwd: tgtApp});
            // add options to package.json

            // change start funcst
            // sync()
            // sync( {options})
            // check( {options})
        }
    });

    console.log(detail);
    //return fullModuleUpdate(detail, next);

    // get all the files in the shared app
    // get all the files in the local app
    // compare each file and copy over missing or changed ones
}

function compareFiles(file1, file2, next) {
    checksum(file1, function(err, sum1) {
        checksum(file2, function(err, sum2) {
            return next(null, sum1 === sum2);
        });
    });
}
