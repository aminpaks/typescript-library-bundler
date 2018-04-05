import * as path from 'path';
import { assert } from 'chai';
import { copyFromTo } from '../src/utils';
import { createNGCConfig, parseConfigFile } from '../src/config-helpers';

describe('ConfigHelpers', () => {

  before((done: Function) => {
    copyFromTo({
      pattern: 'tsconfig*',
      rootDir: path.resolve(process.cwd(), 'integration/project4'),
      toDir: path.resolve(__dirname),
    }).then(() => done());
  });

  const defaultTSConfigPath = path.resolve(__dirname, './tsconfig.json');

  it('createNGCConfig', () => {

    const ngcConfigsPath = path.resolve(__dirname, 'tsconfig.ngc.json');

    let { configs: defaultTSConfig, error } = parseConfigFile(defaultTSConfigPath);
    defaultTSConfig.angularCompilerOptions = {
      annotateForClosureCompiler: false,
    };

    assert.isUndefined(error);
    assert.property(defaultTSConfig, 'compilerOptions');

    const moduleId = 'check-mod';
    const flatModuleId = '@scope/module';
    createNGCConfig(ngcConfigsPath, moduleId, defaultTSConfig, flatModuleId);

    ({ configs: defaultTSConfig, error  } = parseConfigFile(ngcConfigsPath));

    assert.isDefined(defaultTSConfig, 'files');
    assert.isArray(defaultTSConfig.files);
    assert.deepEqual(defaultTSConfig.files, ['./src/public_api.ts']);

    assert.isUndefined(error);
    assert.property(defaultTSConfig, 'compilerOptions');
    assert.propertyVal(defaultTSConfig.compilerOptions, 'outDir', './ngc-compiled');
    assert.propertyVal(defaultTSConfig.compilerOptions, 'module', 'es2015');

    assert.property(defaultTSConfig, 'angularCompilerOptions');
    assert.propertyVal(defaultTSConfig.angularCompilerOptions, 'flatModuleId', flatModuleId);
    assert.propertyVal(defaultTSConfig.angularCompilerOptions, 'annotateForClosureCompiler', false);
  });


  it('createNGCConfig: no flatModuleId', () => {

    const ngcConfigsPath = path.resolve(__dirname, 'tsconfig.ngc.json');

    let { configs: defaultTSConfig, error } = parseConfigFile(defaultTSConfigPath);
    defaultTSConfig.angularCompilerOptions = {
      annotateForClosureCompiler: false,
    };

    assert.isUndefined(error);
    assert.property(defaultTSConfig, 'compilerOptions');

    const moduleId = 'check-mod';
    createNGCConfig(ngcConfigsPath, moduleId, defaultTSConfig);

    ({ configs: defaultTSConfig, error  } = parseConfigFile(ngcConfigsPath));

    assert.isDefined(defaultTSConfig, 'files');
    assert.isArray(defaultTSConfig.files);
    assert.deepEqual(defaultTSConfig.files, ['./src/public_api.ts']);

    assert.isUndefined(error);
    assert.property(defaultTSConfig, 'compilerOptions');
    assert.propertyVal(defaultTSConfig.compilerOptions, 'outDir', './ngc-compiled');
    assert.propertyVal(defaultTSConfig.compilerOptions, 'module', 'es2015');

    assert.property(defaultTSConfig, 'angularCompilerOptions');
    assert.propertyVal(defaultTSConfig.angularCompilerOptions, 'flatModuleId', moduleId);
    assert.propertyVal(defaultTSConfig.angularCompilerOptions, 'annotateForClosureCompiler', false);
  });

  it('parseConfigFile (Extends configs)', () => {
    const loaded = parseConfigFile(defaultTSConfigPath);

    assert.isUndefined(loaded.error);
    assert.isDefined(loaded.configs);

    const { compilerOptions } = loaded.configs;

    assert.isDefined(compilerOptions);
    assert.property(compilerOptions, 'target', 'es5');
    assert.property(compilerOptions, 'module', 'es2015');
  });
});
