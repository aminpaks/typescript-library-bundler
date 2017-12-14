import * as path from 'path';
import { RawSourceMap, SourceMapConsumer, SourceMapGenerator } from 'source-map';
import {
  CompilerOptions,
  createProgram,
  flattenDiagnosticMessageText,
  getPreEmitDiagnostics,
  ModuleKind,
  ScriptTarget,
  transpileModule as tscTranspile,
  TranspileOptions,
} from 'typescript';
import {
  isFile,
  isNil,
  isString,
  mergeInto,
  parseJSON,
  readFile,
  writeFile,
} from './utils';

export interface CodeWithMap {
  code: string;
  map: string | null;
}

export function getSourceWithMap(filePath: string): CodeWithMap | undefined {
  if (!isFile(filePath)) {
    return undefined;
  }

  let code = readFile(filePath);

  if (isNil(code) || !isString(code)) {
    return undefined;
  }

  const sourceMappingRegEx = /^\/+#\s*sourceMappingURL=(.*)$/im;

  const matchArray = sourceMappingRegEx.exec(code);

  if (isNil(matchArray)) {
    return {
      code,
      map: null,
    };

  } else {
    let map: string | null = null;
    const mapFilePath = path.resolve(path.dirname(filePath), matchArray[1]);

    code = code.replace(matchArray[0], '');

    if (isFile(mapFilePath)) {
      map = readFile(mapFilePath);
    }

    return {
      code,
      map,
    };
  }
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

  const codeWithMap = getSourceWithMap(moduleFilePath);

  if (isNil(codeWithMap)) {
    return;
  }

  try {
    const result = await tscTranspile(codeWithMap!.code, options);

    writeFile(destFilePath, result.outputText);

    if (!isNil(result.sourceMapText) && !isNil(codeWithMap.map)) {

      updateSourceMapFor({
        codeWithMap,
        newSourceMap: result.sourceMapText,
        destFilePath,
        originFilePath: moduleFilePath,
        basePath: '',
      });
    }
  } catch (err) {
    throw new Error(`Error in transpile module "${path.basename(moduleFilePath)}": ${err}`);
  }
}

export function updateSourceMapFor({
  codeWithMap,
  newSourceMap,
  destFilePath,
}: { codeWithMap: CodeWithMap; newSourceMap: string; originFilePath: string; destFilePath: string; basePath: string; }): void {
  const newSourceMapConsumer = new SourceMapConsumer(newSourceMap);
  const oldSourceMapConsumer = new SourceMapConsumer(codeWithMap.map!);
  const sourceMapGenerator = new SourceMapGenerator();

  newSourceMapConsumer.eachMapping(mapping => {
    if (isNil(mapping.originalLine)) {
      return;
    }

    const originalMap = oldSourceMapConsumer.originalPositionFor({
      line: mapping.originalLine,
      column: mapping.originalColumn,
    });

    if (isNil(originalMap) || isNil(originalMap.line) || isNil(originalMap.column)) {
      return;
    }

    sourceMapGenerator.addMapping({
      name: originalMap.name!,
      source: originalMap.source!,
      generated: {
        line: mapping.generatedLine,
        column: mapping.generatedColumn,
      },
      original: {
        line: originalMap.line!,
        column: originalMap.column!,
      },
    });
  });


  const sourceMap = sourceMapGenerator.toJSON();

  sourceMap.file = path.basename(path.basename(destFilePath));
  sourceMap.sourcesContent = sourceMap.sources.map(source => oldSourceMapConsumer.sourceContentFor(source)!);

  writeFile(destFilePath + '.map', JSON.stringify(sourceMap));
}

export function readFileSourceMap(filePath: string): RawSourceMap | null {
  if (isFile(filePath)) {
    const fileContent = readFile(filePath);

    return parseJSON(fileContent);
  }

  return null;
}

export function compileFiles(fileNames: string[], options: CompilerOptions): void {
  const program = createProgram(fileNames, options);
  const emitResult = program.emit();

  const allDiagnostics = getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

  allDiagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
      const message = flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    }
    else {
      console.log(`${flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
    }
  });

  const exitCode = emitResult.emitSkipped ? 1 : 0;
  console.log(`Process exiting with code '${exitCode}'.`);
  process.exit(exitCode);
}
