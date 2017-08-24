import * as path from 'path';
import { NodePackage, TSConfigs } from './types';
import { isNil, mergeInto, readFile, writeFile } from './utils';
import { CompilerOptions, convertCompilerOptionsFromJson, Diagnostic, readConfigFile } from 'typescript';

export function parseConfigFile(filePath: string, basePath?: string): {
  configs: TSConfigs;
  error: Diagnostic | undefined;
} {
  const result = readConfigFile(filePath, readFile);

  return {
    configs: result.config,
    error: result.error,
  };
}

export function createNGCConfig(filePath: string, moduleId: string, configs?: TSConfigs): void {
  const result = mergeInto(<TSConfigs>{
    compilerOptions: {
      outDir: './ngc-compiled',
      baseUrl: '.',
      target: 'es2015',
      module: 'es2015',
      sourceMap: false,
      declaration: true,
      lib: [
        'es2017',
        'dom',
      ],
    },
    angularCompilerOptions: {
      strictMetadataEmit: true,
      skipTemplateCodegen: true,
      annotateForClosureCompiler: true,

      flatModuleOutFile: moduleId + '.js',
    },
  }, configs);

  if (!isNil(result.angularCompilerOptions) && isNil(result.angularCompilerOptions.flatModuleId)) {
    result.angularCompilerOptions.flatModuleId = moduleId;
  }
  if (!isNil(result.include)) {
    delete result.include;
  }
  if (!isNil(result.exclude)) {
    delete result.exclude;
  }

  const resultString = JSON.stringify(result);

  writeFile(filePath, resultString);
}

export function readPackage(packageFilePath: string): NodePackage {
  const content = readFile(packageFilePath);
  try {
    return JSON.parse(content);
  } catch (_err) {
    return {} as NodePackage;
  }
}

function isPkgModuleEntryValid(value: string | undefined, entry: string | undefined, projectPath: string): boolean {
  value = path.resolve(projectPath, value);
  entry = path.resolve(projectPath, entry);

  return value.toLowerCase() === entry.toLowerCase();
}

export function validatePkgModuleEntries({
  pkgMain,
  pkgModule,
  pkgES2015,
  pkgTypings,
}: {
    pkgMain?: string;
    pkgModule?: string;
    pkgES2015?: string;
    pkgTypings?: string;
  }, pkg: NodePackage, projectPath: string): void {

  if (!isNil(pkgMain)) {
    if (isNil(pkg.main) || !isPkgModuleEntryValid(pkgMain, pkg.main, projectPath)) {
      console.warn(`Warning: You must set "main" property of your package.json to "${pkgMain.replace(projectPath + path.sep, '')}"`);
    }
  }
  if (!isNil(pkgModule)) {
    if (isNil(pkg.module) || !isPkgModuleEntryValid(pkgModule, pkg.module, projectPath)) {
      console.warn(`Warning: You must set "module" property of your package.json to "${pkgModule.replace(projectPath + path.sep, '')}"`);
    }
  }
  if (!isNil(pkgES2015)) {
    if (isNil(pkg.es2015) || !isPkgModuleEntryValid(pkgES2015, pkg.es2015, projectPath)) {
      console.warn(`Warning: You must set "es2015" property of your package.json to "${pkgES2015.replace(projectPath + path.sep, '')}"`);
    }
  }
  if (!isNil(pkgTypings)) {
    if (isNil(pkg.typings) || !isPkgModuleEntryValid(pkgTypings, pkg.typings, projectPath)) {
      console.warn(`Warning: You must set "typings" property of your package.json to "${pkgTypings.replace(projectPath + path.sep, '')}"`);
    }
  }
}
