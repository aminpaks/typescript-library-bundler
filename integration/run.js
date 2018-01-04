const path = require('path');
const utils = require('./utils');
const args = require('minimist')(process.argv.slice(2));

const specificProject = args._.shift();

require('ts-node').register({
  compilerOptions: {
    target: 'es2016',
    module: 'commonjs',
    sourceMap: true,
    noUnusedLocals: false,
    noUnusedParameters: false,
    noImplicitAny: false,
    noImplicitReturns: false,
    noImplicitThis: false,
    declaration: false,
    strict: false,
    strictNullChecks: false,
  },
});

/**
 * Run all integration projects
 * You can pass one specific project as the first
 * parameter of `getProjects`:
 * utils.getProjects('project4')...
 */
utils.runProjects(utils.getProjects(specificProject));
