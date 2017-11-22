import * as path from 'path';
import * as less from 'less';
import { mergeInto } from '../utils';
import { LessResolver } from './less-resolver';
import { resolveNodeModulePaths } from '../external-modules';
import { BundlerPluginsOptions } from '../types';

export async function renderLess(content: string, filePath: string, projectRootDir: string, pluginsOptions: BundlerPluginsOptions): Promise<string> {
  let result = '';

  try {
    const { less: compilerOptions = {} } = pluginsOptions;
    const finalCompilerOptions = mergeInto({
      filename: '',
      relativeUrls: true,
      ieCompat: false,
    }, compilerOptions);

    const nodeModulePaths = await resolveNodeModulePaths(projectRootDir);

    const currentDir = path.dirname(filePath);

    finalCompilerOptions.filename = path.join(currentDir, path.basename(filePath));
    finalCompilerOptions.plugins = [LessResolver({ nodeModulePaths })];

    const lessResult = await less.render(content, finalCompilerOptions);
    result = lessResult.css;
  } catch (err) {
    throw new Error(`Less compiler ${err.message}\n\nWhile compiling => "${content}`);
  }

  return result;
}
