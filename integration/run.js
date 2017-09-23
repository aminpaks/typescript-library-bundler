const path = require('path');
const utils = require('./utils');

require('ts-node').register();
require('source-map-support').install();

/**
 * Run all integration projects
 * You can pass one specific project as the first
 * parameter of `getProjects`:
 * utils.getProjects('project4')...
 */
utils.runProjects(utils.getProjects());
