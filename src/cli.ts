#!/usr/bin/env node
/**
 * @license Typescript-Library-Bundler v0.2.0
 * (c) 2017 Amin Paks <amin.pakseresht@hotmail.com>
 * License: MIT
 */
import * as path from 'path';
import * as ms from 'minimist';
import { main } from './main';
import { isDirectory, isFile, isString } from './utils';


export function parseArguments(args: string[]): {
  outDir: string;
  project: string | undefined;
  noClean: boolean;
  noPkgValidation: boolean;
  noDepsValidation: boolean;
} {
  const minimistOptions = {
    alias: {
      'o': 'outDir',
      'p': 'project',
      'k': 'noClean',
      'g': 'noPkgValidation',
      'd': 'noDepsValidation',
    },
    defaults: {
      outDir: './dist',
      project: undefined,
      noClean: false,
      noPkgValidation: false,
      noDepsValidation: false,
    },
    boolean: ['k', 'noClean', 'g', 'noPkgValidation', 'd', 'noDepsValidation'],
    string: ['o', 'outDir', 'p', 'project'],
  };

  return ms(args, minimistOptions) as any;
}

if (require && require.main === module) {
  const args = parseArguments(process.argv.slice(2));
  const project = args.project || process.cwd();

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

  main(projectPath, projectConfigPath, {
    outDir: args.outDir,
    noClean: args.noClean,
    noPkgValidation: args.noPkgValidation,
    noDepsValidation: args.noDepsValidation,
  })
    .then(() => {
      console.log('Bundle completed successfully!');
      process.exit(0);
    })
    .catch((err) => {
      const message = (err.stack || err).toString();
      console.error('Bundle halted!\n' + message);
      process.exit(1);
    });
}
