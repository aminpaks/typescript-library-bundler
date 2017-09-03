#!/usr/bin/env node
/**
 * @license Typescript-Library-Bundler v0.0.8
 * (c) 2017 Amin Paks <amin.pakseresht@hotmail.com>
 * License: MIT
 */
import * as path from 'path';
import * as ms from 'minimist';
import { main } from './main';
import { isDirectory, isFile, isString } from './utils';

if (require && require.main === module) {
  const args = ms(process.argv.slice(2));
  const project = args.project || args.p || process.cwd();

  if (!isString(project)) {
    throw new Error('Project argument is invalid');
  }

  let projectPath = project.replace(/['"]/g, '');
  let projectConfigPath = '';
  if (!path.isAbsolute(project)) {
    projectPath = path.resolve(process.cwd(), projectPath);
  }

  if (isFile(projectPath)) {
    projectConfigPath = path.resolve(projectPath);
    projectPath = path.dirname(project);
  } else if (isDirectory(projectPath)) {
    projectConfigPath = path.resolve(projectPath, 'tsconfig.json');
  } else {
    throw new Error('A valid path is required to project directory or tsconfig!');
  }

  main(projectPath, projectConfigPath)
    .then(() => {
      console.log('Bundle completed successfully!');
      process.exit(1);
    })
    .catch((err) => {
      console.error('Bundle halted!\n' + err);
      process.exit(0);
    });
}
