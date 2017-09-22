/**
 * @license Typescript-Library-Bundler v0.0.13
 * (c) 2017 Amin Paks <amin.pakseresht@hotmail.com>
 * License: MIT
 */

import * as path from 'path';
import * as uglify from 'rollup-plugin-uglify';
import { main as ngcCompiler } from '@angular/tsc-wrapped';

import { preprocessTSFiles } from './preprocess-files';
import { getTranspileOptions, transpileModule } from './tsc';
import { defaultConfigs as rollupConfig, rollupBy } from './rollup';
import { createNGCConfig, getSafePackageName, parseConfigFile, readPackage, validatePkgModuleEntries } from './config-helpers';
import {
  copyFromTo,
  ensureMakeDir,
  ensureRemoveDir,
  isArray,
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
  const { files = [], bundlerOptions = {} } = configs;
  const { entry: possibleEntry } = bundlerOptions;

  if (isNil(possibleEntry) && isNil(files)) {
    throw new Error('Project tsconfig must have an entry barrel file to export the library implementations!');
  }
  if (isString(possibleEntry) && !isEmpty(possibleEntry)) {
    entryFile = path.resolve(configFileDir, possibleEntry);
  } else {
    if (!isArray(files)) {
      throw new Error('tsconfig "files" property has to be an array');

    } else if (files.length !== 1) {
      throw new Error('Project entry file must point to only one file!\n'
        + 'Current "files" property from tsconfig:\n' + files.join('\n'));

    } else {
      entryFile = path.resolve(configFileDir, [...files].shift());
    }
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
  await preprocessTSFiles(entryFile, buildDir, configFileDir);

  // AngularCompiler configurations
  const ngcBuildDir = path.resolve(buildDir, 'ngc-compiled');
  const ngcConfigPath = path.resolve(buildDir, 'tsconfig-ngc.json');
  createNGCConfig(ngcConfigPath, moduleId, configs);

  // Compile with NGC
  await ngcCompiler(ngcConfigPath, { basePath: buildDir });

  const { externals = {} } = bundlerOptions;
  const externalModules = externals;
  const outputES5Module = path.resolve(outDir, moduleId + '.es5.js');
  const outputES6Module = path.resolve(outDir, moduleFilename);

  // Bundle for ES6
  const rollupEntryFile = path.resolve(ngcBuildDir, moduleFilename);
  const rollupES2015Config = rollupConfig({
    moduleEntry: rollupEntryFile,
    moduleName: moduleId,
    outputPath: outputES6Module,
    customGlobals: externalModules,
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
    customGlobals: externalModules,
  });
  await rollupBy(rollupUMDConfig);

  // Bundle for minified UMD
  const outputMinifiedUMDModule = path.resolve(bundlesDir, moduleId + '.umd.min.js');
  const rollupMinifiedUMDConfig = rollupConfig({
    format: 'umd',
    moduleEntry: outputES5Module,
    moduleName: packageName,
    outputPath: outputMinifiedUMDModule,
    customGlobals: externalModules,
    plugins: [uglify()],
  });
  await rollupBy(rollupMinifiedUMDConfig);

  // Copy declarations and metadata files
  await copyFromTo({
    pattern: '**/*(*.d.ts|*.metadata.json)',
    rootDir: ngcBuildDir,
    toDir: outDir,
  });

  // Validation of distribution files in package.json
  const outputTypings = path.resolve(outDir, moduleId + '.d.ts');
  validatePkgModuleEntries({
    pkgMain: outputUMDModule,
    pkgModule: outputES5Module,
    pkgES2015: outputES6Module,
    pkgTypings: outputTypings,
  }, packageConfigs, projectPath);
}
