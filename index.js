// This file used for the node.js package only, not required for browser-based applications

global.inBrowser = false;

const buildCalculator = require('./calc').buildCalculator,
    builders = require('./builders');


exports.buildLocation = builders.buildLocation;
exports.buildClock = builders.buildClock;
exports.buildRightAscension = builders.buildRightAscension;
exports.buildDeclination = builders.buildDeclination;
exports.buildCalculator = buildCalculator;

