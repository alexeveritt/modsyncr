#!/usr/bin/env node
if (require('./lib/help')()) {
    return;
}

var syncr = require('./lib/syncr');
var setup = require('./lib/setup');

setup.options();
syncr.sync();