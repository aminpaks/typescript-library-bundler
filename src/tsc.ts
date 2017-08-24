import * as path from 'path';
import {
  ModuleKind,
  ScriptKind,
  ScriptTarget,
  transpileModule as tscTranspile,
  TranspileOptions,
  TranspileOutput,
} from 'typescript';
import {
  isNil,
  isString,
  mergeInto,
  readFile,
  writeFile,
} from './utils';

export function removeSourceMaps(content: string): string {
  if (!isString(content)) {
    return content;
  }
  return content.replace(/^\/+#\s*sourceMappingURL=.*$/igm, '');
}

export function getTranspileOptions(overwriteOptions: TranspileOptions): TranspileOptions {
  return mergeInto({
    compilerOptions: {
      sourceMap: true,
      target: ScriptTarget.ES5,
      module: ModuleKind.ES2015,
    },
  }, overwriteOptions);
}

export async function transpileModule(moduleFilePath: string, options: TranspileOptions, destFilePath?: string): Promise<void> {

  if (isNil(destFilePath)) {
    destFilePath = moduleFilePath;
  }
  if (isNil(options.compilerOptions)) {
    throw new Error('Error: Transpile requires compiler options!');
  }

  const moduleContent = removeSourceMaps(readFile(moduleFilePath));

  try {
    const result = await tscTranspile(moduleContent, options);

    writeFile(destFilePath, result.outputText);
    if (!isNil(result.sourceMapText)) {
      writeFile(destFilePath + '.map', result.sourceMapText);
    }
  } catch (err) {
    throw new Error(`Error in transpile module "${path.basename(moduleFilePath)}": ${err}`);
  }
}
