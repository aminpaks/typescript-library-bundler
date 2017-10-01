/**
 * @license Typescript-Library-Bundler v0.0.14
 * (c) 2017 Amin Paks <amin.pakseresht@hotmail.com>
 * License: MIT
 */

import * as path from 'path';
import * as uglify from 'rollup-plugin-uglify';
import { main as ngcCompiler } from '@angular/tsc-wrapped';

import { preprocessTSFiles } from './preprocess-files';
import { getExternalModuleNames } from './external-modules';
import { getTranspileOptions, transpileModule } from './tsc';
import { defaultConfigs as rollupConfig, rollupBy } from './rollup';
import { ExternalModules } from './types';
import {
  createNGCConfig,
  getSafePackageName,
  parseConfigFile,
  readPackage,
  validatePkgDependencies,
  validatePkgModuleEntries,
} from './config-helpers';
import {
  copyFromTo,
  ensureMakeDir,
  ensureRemoveDir,
  isEmpty,
  isFile,
  isNil,
  isString,
} from './utils';


export async function main(projectPath: string, configFilePath?: string): Promise<void> {

  if (!path.isAbsolute(projectPath)) {
    projectPath = path.resolve(process.cwd(), projectPath);
  }

  if (isNil(configFilePath)) {
    configFilePath = path.resolve(projectPath, 'tsconfig.json');
  }
  const configFileDir = path.dirname(configFilePath);
  const { configs, error } = parseConfigFile(configFilePath);

  if (!isNil(error)) {
    throw new Error(error.messageText.toString());
  }

  let entryFile: string;
  const { bundlerOptions = {} } = configs;
  const { entry: possibleEntry } = bundlerOptions;

  if (isString(possibleEntry) && !isEmpty(possibleEntry)) {
    entryFile = path.resolve(configFileDir, possibleEntry);
  } else {
    throw new Error('Project tsconfig must have an "entry" that points to the a file to export the library implementations!');
  }

  if (!isFile(entryFile)) {
    throw new Error('Cannot find the entry file ');
  }

  const packageFilePath = path.resolve(projectPath, 'package.json');
  const buildDir = path.resolve(projectPath, '.compile');
  const defaultOutDir = bundlerOptions.outDir || './dist';
  const outDir = path.resolve(projectPath, defaultOutDir);

  const packageConfigs = readPackage(packageFilePath);
  const { name: packageName } = packageConfigs;
  const moduleId = getSafePackageName(packageName);
  const moduleFilename = moduleId + '.js';

  if (isNil(moduleId)) {
    throw new Error(`Package name includes invalid characters "${packageName}"!`); // `
  }

  if (isNil(packageName)) {
    throw new Error('Project package.json has no name entry!');
  }

  if (path.basename(entryFile, '.ts') === 'index') {
    throw new Error('Project entry file cannot be named "index.ts"! try "public_api.ts" instead.');
  }

  // Clean up working directory
  ensureRemoveDir(buildDir);
  ensureRemoveDir(outDir);
  ensureMakeDir(buildDir);

  // Preprocess typescript files
  const projectFileList = await preprocessTSFiles(entryFile, buildDir, configFileDir);

  // Resolve all external modules
  const { externalModules = {} } = bundlerOptions;

  // Initializes with an empty object
  let libraryExternalModules: ExternalModules = {};

  // Read external module definitions
  if (externalModules !== false) {
    libraryExternalModules = await getExternalModuleNames(projectFileList, projectPath, externalModules);
  }

  // AngularCompiler configurations
  const ngcBuildDir = path.resolve(buildDir, 'ngc-compiled');
  const ngcConfigPath = path.resolve(buildDir, 'tsconfig-ngc.json');
  createNGCConfig(ngcConfigPath, moduleId, configs);

  // Compile with NGC
  await ngcCompiler(ngcConfigPath, { basePath: buildDir });

  const { commonJsSettings } = bundlerOptions;
  const outputES5Module = path.resolve(outDir, moduleId + '.es5.js');
  const outputES6Module = path.resolve(outDir, moduleFilename);

  // Bundle for ES6
  const rollupEntryFile = path.resolve(ngcBuildDir, moduleFilename);
  const rollupES2015Config = rollupConfig({
    moduleEntry: rollupEntryFile,
    moduleName: moduleId,
    outputPath: outputES6Module,
    externalModules: libraryExternalModules,
    commonJsSettings,
  });
  await rollupBy(rollupES2015Config);

  // Transpile ES6 into ES5
  const transpileConfigES5 = getTranspileOptions({
    compilerOptions: { allowJs: true },
    moduleName: moduleId,
    fileName: moduleId,
  });
  await transpileModule(outputES6Module, transpileConfigES5, outputES5Module);

  // CommonJS bundles directory
  const bundlesDir = path.resolve(outDir, 'bundles');

  // Bundle for UMD
  const outputUMDModule = path.resolve(bundlesDir, moduleId + '.umd.js');
  const rollupUMDConfig = rollupConfig({
    format: 'umd',
    moduleEntry: outputES5Module,
    moduleName: moduleId,
    outputPath: outputUMDModule,
    externalModules: libraryExternalModules,
    commonJsSettings,
  });
  await rollupBy(rollupUMDConfig);

  // Bundle for minified UMD
  const outputMinifiedUMDModule = path.resolve(bundlesDir, moduleId + '.umd.min.js');
  const rollupMinifiedUMDConfig = rollupConfig({
    format: 'umd',
    moduleEntry: outputES5Module,
    moduleName: moduleId,
    outputPath: outputMinifiedUMDModule,
    externalModules: libraryExternalModules,
    commonJsSettings,
    plugins: [uglify()],
  });
  await rollupBy(rollupMinifiedUMDConfig);

  // Copy declarations and metadata files
  await copyFromTo({
    pattern: '**/*(*.d.ts|*.metadata.json)',
    rootDir: ngcBuildDir,
    toDir: outDir,
  });

  // Validation of dependencies in package.json
  validatePkgDependencies(packageConfigs, Object.keys(libraryExternalModules));

  // Validation of distribution files in package.json
  const outputTypings = path.resolve(outDir, moduleId + '.d.ts');
  validatePkgModuleEntries({
    pkgMain: outputUMDModule,
    pkgModule: outputES5Module,
    pkgES2015: outputES6Module,
    pkgTypings: outputTypings,
  }, packageConfigs, projectPath);
}
