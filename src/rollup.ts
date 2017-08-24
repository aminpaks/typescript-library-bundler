import * as path from 'path';
import * as uglify from 'rollup-plugin-uglify';
import * as nodeResolve from 'rollup-plugin-node-resolve';
import * as absModuleFix from 'rollup-plugin-absolute-module-fix';
import { isNil } from './utils';
import { GlobalModules } from './rollup-globals';
import { Format, Options, Plugin, rollup, Warning, WriteOptions } from 'rollup';

export type RollupCustomOptions = Options & WriteOptions;
export interface CustomGlobals {
  [moduleId: string]: string;
}

export function defaultConfigs({
  format,
  moduleName,
  moduleEntry,
  outputPath,
  customGlobals,
  plugins,
}: {
  format?: Format;
  moduleName: string;
  moduleEntry: string;
  outputPath: string;
  plugins?: Plugin[];
  customGlobals?: CustomGlobals;
}): RollupCustomOptions {
  if (isNil(customGlobals)) {
    customGlobals = {};
  }

  if (isNil(plugins)) {
    plugins = [];
  }

  if (isNil(format)) {
    format = 'es';
  }

  return {
    moduleName,
    format,
    entry: moduleEntry,
    dest: outputPath,
    external: Object.keys({ ...GlobalModules, ...customGlobals }),
    globals: { ...GlobalModules, ...customGlobals },
    onwarn: (warn) => {
      if (warn.code !== 'THIS_IS_UNDEFINED') {
        console.warn(`Rollup: ${warn.code} -- ${warn.message}`);
      }
    },
    sourceMap: true,
    plugins: [
      nodeResolve({
        main: true,
        jsnext: true,
      }),
      absModuleFix(),
    ].concat(plugins),
  };
}

export async function rollupBy(configs: RollupCustomOptions): Promise<void> {
  const result = await rollup(configs);
  await result.write(configs);
}
