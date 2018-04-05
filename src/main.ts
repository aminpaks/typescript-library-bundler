/**
 * @license Typescript-Library-Bundler v0.2.3
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
import { BundlerBuildOptions, ExternalModules } from './types';
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
  isAngularLib,
  isEmpty,
  isFile,
  isNil,
  isString,
} from './utils';


export async function main(projectPath: string, configFilePath?: string, buildOptions: BundlerBuildOptions = {}): Promise<void> {

  if (!path.isAbsolute(projectPath)) {
    projectPath = path.resolve(process.cwd(), projectPath);
  }

  if (isNil(configFilePath)) {
    configFilePath = path.resolve(projectPath, 'tsconfig.json');
  }
  const projectRootDir = path.dirname(configFilePath);
  const { configs, error } = parseConfigFile(configFilePath);

  if (!isNil(error)) {
    throw new Error(error.messageText.toString());
  }

  let entryFile: string;
  const { bundlerOptions = {} } = configs;
  const { entry: possibleEntry } = bundlerOptions;

  if (isString(possibleEntry) && !isEmpty(possibleEntry)) {
    entryFile = path.resolve(projectRootDir, possibleEntry);
  } else {
    throw new Error('Project tsconfig must have an "entry" that points to the a file to export the library implementations!');
  }

  if (!isFile(entryFile)) {
    throw new Error('Cannot find the entry file ');
  }

  const packageFilePath = path.resolve(projectPath, 'package.json');
  const buildDir = path.resolve(projectPath, '.compile');
  const defaultOutDir = buildOptions.outDir || bundlerOptions.outDir || './dist';
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
  ensureMakeDir(buildDir);

  // Bundler plugins options
  const { plugins: bundlerPluginsOptions = {} } = bundlerOptions;
  // Skip clean-up if project path is equal out dir
  if (projectPath === outDir) {
    console.log(`Warning: Skipping cleaning build dir because it's equal the current working directory!`); // `;
  } else if (buildOptions.noClean !== true) {
    ensureRemoveDir(outDir);
  }

  // Preprocess typescript files
  const projectFileList = await preprocessTSFiles(entryFile, buildDir, projectRootDir, bundlerPluginsOptions);

  // Resolve all external modules
  const { externals, externalModules = {} } = bundlerOptions;

  // Initializes with an empty object
  let libraryExternalModules: ExternalModules = {};

  // Read external module definitions
  if (externalModules !== false) {
    libraryExternalModules = await getExternalModuleNames(projectFileList, projectPath, externals || externalModules);
  }

  // AngularCompiler configurations
  const ngcBuildDir = path.resolve(buildDir, 'ngc-compiled');
  const ngcConfigPath = path.resolve(buildDir, 'tsconfig-ngc.json');
  createNGCConfig(ngcConfigPath, moduleId, configs, packageName);

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
  const isAngular = isAngularLib(libraryExternalModules);
  const copyDeclarationPattern = `**/*(*.d.ts${isAngular ? '|*.metadata.json' : ''})`;
  await copyFromTo({
    pattern: copyDeclarationPattern,
    rootDir: ngcBuildDir,
    toDir: outDir,
  });

  // Validation of dependencies in package.json
  if (buildOptions.noDepsValidation !== true) {
    const { keys } = Object;
    validatePkgDependencies(packageConfigs, keys(libraryExternalModules));
  }

  // Validation of distribution files in package.json
  if (buildOptions.noPkgValidation !== true) {
    const outputTypings = path.resolve(outDir, moduleId + '.d.ts');
    validatePkgModuleEntries({
      pkgMain: outputUMDModule,
      pkgModule: outputES5Module,
      pkgES2015: outputES6Module,
      pkgTypings: outputTypings,
    }, packageConfigs, projectPath);
  }
}
