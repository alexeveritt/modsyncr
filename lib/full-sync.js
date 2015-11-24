var packageFile = require('./package-file');
var process = require('process');
var spawn = require('child_process').spawn;
var path = require('path');

module.exports = function(detail, next) {
    // filename of package file in the node_modules folder for the shared package
    var pkgFilename = path.join(detail.nodeModulesDirectory, detail.name, 'package.json');

    // remove the version number from the shared package file which will force
    // npm update to refresh the contents
    packageFile.removePackageVersion(pkgFilename, function() {

        // reset the current working dir to that of the application being updated
        var cwd = process.cwd();
        process.chdir(detail.packageDirectory);

        // call npm update on the current directory
        updateNodeModules(function(err) {
            if (err) {
                console.error(err);
            }
            // reset the cwd to the original value
            process.chdir(cwd);
            return next();
        });
    });
}

function updateNodeModules(next) {
    console.info('Starting full-sync of "%s"', process.cwd());
    var proc = spawn('npm', ['update']);

    proc.on('close', function() {
        return next();
    });
}