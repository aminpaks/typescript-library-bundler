import * as path from 'path';
import { Diagnostic, formatDiagnostics, sys } from 'typescript';

import { clearError, isEmpty } from './utils';
import { CompileResult, TSConfigs } from './types';
import { createNGCConfig } from './config-helpers';


export async function compileLibrary({
  configs,
  buildDir,
  moduleId,
}: {
    configs: TSConfigs;
    buildDir: string;
    moduleId: string;
  }): Promise<CompileResult> {

  // Creates Angular TSConfig
  const ngcConfigPath = path.resolve(buildDir, 'tsconfig-ngc.json');
  createNGCConfig(ngcConfigPath, moduleId, configs);

  // Loads compiler
  const compilerModule = await import('@angular/compiler-cli');
  const { VERSION } = compilerModule;
  const ngcBuildDir = path.resolve(buildDir, 'ngc-compiled');
  const compiledEntry = path.resolve(ngcBuildDir, moduleId + '.js');

  if (VERSION.major === '4') {
    // @ts-ignore
    const { main: ngcCompiler } = compilerModule;

    // Compiles with NGC
    try {
      await ngcCompiler(ngcConfigPath, { basePath: buildDir });
    } catch (err) {
      const message = clearError(err);
      throw new Error(`Angular Compiler: ${message}`);
    }
  } else if (VERSION.major === '5') {
    // @ts-ignore
    const { readConfiguration, performCompilation } = compilerModule;
    const compilerConfigs = readConfiguration(ngcConfigPath);

    const compilationResult = performCompilation(compilerConfigs);

    if (!isEmpty(compilationResult.diagnostics)) {
      const diagnosticHost = {
        getCurrentDirectory: () => { return buildDir || sys.getCurrentDirectory(); },
        getCanonicalFileName: (fileName: string) => fileName,
        getNewLine: () => sys.newLine,
      };
      const errors = formatDiagnostics(compilationResult.diagnostics as Diagnostic[], diagnosticHost);

      throw new Error(`Angular compiler: ${errors}`);
    }
  } else {
    throw new Error('Cannot find Angular compiler neither version 4 or 5!\n' +
      'Make sure you have both "@angular/compiler" and "@angular/compiler-cli" installed.');
  }

  return {
    dir: ngcBuildDir,
    entry: compiledEntry,
  };
}
