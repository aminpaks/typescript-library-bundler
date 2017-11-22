// Type definitions for LESS
// Project: http://lesscss.org/
// Definitions by: Tom Hasner <https://github.com/thasner>, Pranay Prakash <https://github.com/pranaygp>, Amin Paks <https://github.com/aminpaks>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module 'less' {
  interface RootFileInfo {
    filename: string;
    relativeUrls: boolean;
    rootpath: string;
    currentDirectory: string;
    entryPath: string;
    rootFilename: string;
  }

  class PluginManager {
    constructor(less: LessStatic);

    addPreProcessor(preProcessor: PreProcessor, priority?: number): void;
  }

  interface Plugin {
    install: (less: LessStatic, pluginManager: PluginManager) => void;
  }

  interface PreProcessor {
    process: (src: string, extra: PreProcessorExtraInfo) => string;
  }


  interface FileManagerResult {
    contents: string | undefined;
    filename: string;
  }

  interface FileManager {
    new (): FileManager;

    supports(filename: string, currentDirectory: string, options: Options): boolean;
    supportsSync(filename: string, currentDirectory: string, options: Options): boolean;
    loadFile(filename: string, currentDirectory: string, options: Options): Promise<FileManagerResult>;
    loadFileSync(filename: string, currentDirectory: string, options: Options): FileManagerResult;
  }

  interface PreProcessorExtraInfo {
    context: {
      pluginManager: PluginManager;
    };

    fileInfo: RootFileInfo;

    imports: {
      [key: string]: any;
    };
  }

  interface SourceMapOption {
    sourceMapURL?: string;
    sourceMapBasepath?: string;
    sourceMapRootpath?: string;
    outputSourceFiles?: boolean;
    sourceMapFileInline?: boolean;
  }

  interface StaticOptions {
    async: boolean;
    fileAsync: boolean;
  }

  interface Options {
    sourceMap?: SourceMapOption;
    filename?: string;
    plugins?: Plugin[];
    rootFileInfo?: RootFileInfo;
  }

  interface RenderError {
    column: number;
    extract: string[];
    filename: string;
    index: number;
    line: number;
    message: string;
    type: string;
  }

  interface RenderOutput {
    css: string;
    map: string;
    imports: string[];
  }

  interface LessStatic {
    options: StaticOptions;

    render(input: string, callback: (error: RenderError, output: RenderOutput) => void): void;
    render(input: string, options: Options, callback: (error: RenderError, output: RenderOutput) => void): void;

    render(input: string): Promise<RenderOutput>;
    render(input: string, options: Options): Promise<RenderOutput>;

    FileManager: FileManager;

    version: number[];
  }

  const ModuleExport: LessStatic;

  export = ModuleExport;
}
