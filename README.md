# modsyncr

npm install modsyncr

modsyncr makes it easy to keep locally referenced node modules in sync without requiring a package version update.
It is intended to help when working on large projects that need to be broken into seperate packages.
With modsyncr you can locally reference packages e.g. require('mysharedpackage') without having to worry about managing paths or symbolic links.

Example app sturucture

```
mainApp // any file in mainApp can access utilApp by using require(utilApp)
  |--node_modules
      |--utilApp // file:../utilApp
      |--dataApp // file:../dataApp
libs
  |--utilApp // shared app referenced by mainApp
  |--dataApp // shared app referenced by mainApp
```

mainApp uses the modules utilApp and dataApp and all 3 apps are being developed at the same time. When the mainApp is run, any changes to the utilApp and dataApp will not appear in the node_modules folder of the mainApp

To force utilApp / dataApp to refresh you would either need to delete them from the mainApp node_modules folder and run npm install or bump up the version number of the utilApp/dataApp and run npm update on the mainApp

This is especially slow if there are other modules that require complication.

Modsyncr will analyse all the packages and find any locally referenced packages. It will then compare the packages and if the dependencies have changed then it will force a full update using npm update. If only files that make up the actual referenced package have changed then modsyncr will just copy the changed files over. This is extremely fast.

Modsyncr can be run as part of a grunt/gulp build routine or run from the command line

Code usage
var modsyncr = require(‘modsyncr’);
modsyncr.sync(function done(){
	console.log(‘sync done!’);
});

command line
node modsyncr

global install
npm install –g modsyncr
