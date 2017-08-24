#!/usr/bin/env node
/**
 * @license Typescript-Library-Bundler v0.0.1
 * (c) 2017 Amin Paks <amin.pakseresht@hotmail.com>
 * License: MIT
 */
const path = require('path');
const argv = require('yargs').argv;
const ngPkgr = require('../dist/');

if (require && require.main) {
  const project = argv.project || argv.p || process.cwd();

  let projectPath = path.resolve(project.replace(/['"]/g, ''));
  let projectConfigPath = '';

  if (ngPkgr.isFile(projectPath)) {
    projectConfigPath = projectPath;
    projectPath = path.dirname(project);
  } else if (ngPkgr.isDirectory(projectPath)) {
    projectConfigPath = path.resolve('tsconfig.json');
  }

  ngPkgr
    .main(projectPath, projectConfigPath)
    .then(() => console.log('Bundle completed successfully!'))
    .catch((err) => console.error('Bundle halted!\n' + err));
}
