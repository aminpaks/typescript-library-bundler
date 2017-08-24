const path = require('path');
const utils = require('./utils');

require('ts-node').register();
require('source-map-support').install();

// Run all integration projects
utils.runProjects(utils.getProjects(), () => console.log('All done!'));
