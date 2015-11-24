var path = require('path');
var glob = require('glob');
var fs = require('fs');
var _ = require('lodash');

var checksum = require('checksum');
var fullSync = require('./full-sync');
var packageFile = require('./package-file');

module.exports = function(detail, next) {
    var tgtApp = path.join(detail.nodeModulesDirectory, detail.name);
    var tgtAppPackageFile = path.join(tgtApp, 'package.json');
    var srcApp = detail.location;
    var srcAppPackageFile = path.join(srcApp, 'package.json');

    var theSame = packageFile.hasSameDependencies(tgtAppPackageFile, srcAppPackageFile);
    if (!theSame) {
        // the package files have changed so don't mess around
        return fullSync(detail, next);
    }
    else {
        console.info('Starting fast-sync from "%s" to "%s"', srcApp, tgtApp);
        // glob all the files -- not hte node modules
        var targetFiles = glob.sync('**/*', {ignore: ['**/node_modules/**'], cwd: tgtApp});
        var sourceFiles = glob.sync('**/*', {ignore: ['**/node_modules/**'], cwd: srcApp});
        var fileCount = sourceFiles.length;

        var deletedFiles = _.difference(targetFiles, sourceFiles);
        _.forEach(deletedFiles, function(file) {
            var tgtFile = path.join(tgtApp, file);
            if (fs.existsSync(tgtFile)) {
                fs.unlinkSync(tgtFile);
            }
        });

        _.forEach(sourceFiles, function(file) {
            // check if file exists in
            if (file !== 'package.json') {
                var srcFile = path.join(srcApp, file);
                var tgtFile = path.join(tgtApp, file);
                if (!fs.existsSync(tgtFile)) {
                    copyFileSync(srcFile, tgtFile);
                    if (!--fileCount) {
                        console.info('Completed fast-sync between "%s" and "%s"', srcApp, tgtApp);
                        next();
                    }
                }
                else {
                    compareFiles(tgtFile, srcFile, function(err, theSame) {
                        if (!theSame) {
                            copyFileSync(srcFile, tgtFile);
                        }
                        if (!--fileCount) {
                            console.info('Completed fast-sync between "%s" and "%s"', srcApp, tgtApp);
                            next();
                        }
                    });
                }
            }
            else {
                if (!--fileCount) {
                    console.info('Completed fast-sync between "%s" and "%s"', srcApp, tgtApp);
                    next();
                }
            }
        });
    }
}

function copyFileSync(src, tgt) {
    if (fs.existsSync(tgt)) {
        fs.unlinkSync(tgt);
    }
    fs.createReadStream(src).pipe(fs.createWriteStream(tgt));
}

function compareFiles(file1, file2, next) {
    checksum.file(file1, function(err, sum1) {
        checksum.file(file2, function(err, sum2) {
            return next(null, sum1 === sum2);
        });
    });
}
