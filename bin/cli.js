#!/usr/bin/env node
/**
 * @license Typescript-Library-Bundler v0.0.1
 * (c) 2017 Amin Paks <amin.pakseresht@hotmail.com>
 * License: MIT
 */
const path = require('path');
const ms = require('minimist-string');
const ngPkgr = require('../dist/');

if (require && require.main) {
  const args = ms(process.argv.slice(0).pop());
  const project = args.project || args.p || process.cwd();

  let projectPath = project.replace(/['"]/g, '');
  let projectConfigPath = '';
  if (!path.isAbsolute(project)) {
    projectPath = path.resolve(process.cwd(), projectPath);
  }

  if (ngPkgr.isFile(projectPath)) {
    projectConfigPath = path.resolve(projectPath);
    projectPath = path.dirname(project);
  } else if (ngPkgr.isDirectory(projectPath)) {
    projectConfigPath = path.resolve(projectPath, 'tsconfig.json');
  } else {
    throw new Error('A valid path is required to project directory or tsconfig!');
  }

  ngPkgr
    .main(projectPath, projectConfigPath)
    .then(() => console.log('Bundle completed successfully!'))
    .catch((err) => console.error('Bundle halted!\n' + err));
}
