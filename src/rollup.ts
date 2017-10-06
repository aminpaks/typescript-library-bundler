import * as commonjs from 'rollup-plugin-commonjs';
import * as nodeResolve from 'rollup-plugin-node-resolve';
import * as absModuleFix from 'rollup-plugin-absolute-module-fix';
import { ExternalModules } from './types';
import { GlobalModules } from './rollup-globals';
import { convertModuleToCommonJs, isExternalModule } from './external-modules';
import { Format, Options, Plugin, rollup, WriteOptions } from 'rollup';

export type RollupCustomOptions = Options & WriteOptions;

export function defaultConfigs({
  format = 'es',
  moduleName,
  moduleEntry,
  outputPath,
  externalModules = {},
  commonJsSettings = {},
  plugins = [],
}: {
    format?: Format;
    moduleName: string;
    moduleEntry: string;
    outputPath: string;
    plugins?: Plugin[];
    externalModules?: ExternalModules;
    commonJsSettings?: any;
  }): RollupCustomOptions {

  return {
    moduleName,
    format,
    entry: moduleEntry,
    dest: outputPath,
    external: (id: string) => isExternalModule(externalModules, id),
    globals: <any>((id: string) => GlobalModules[id] || convertModuleToCommonJs(id)),
    sourceMap: true,
    onwarn: (warn) => {
      if (warn.code !== 'THIS_IS_UNDEFINED') {
        console.warn(`Warning: Rollup - ${warn.code} -- ${warn.message}`);
      }
    },
    plugins: [
      nodeResolve({
        main: true,
        jsnext: true,
      }),
      commonjs(commonJsSettings),
      absModuleFix(),
    ].concat(plugins),
  };
}

export async function rollupBy(configs: RollupCustomOptions): Promise<void> {
  const result = await rollup(configs);
  await result.write(configs);
}
