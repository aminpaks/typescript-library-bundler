export interface TSConfigs {
  compilerOptions?: {
    allowJs?: boolean;
    allowSyntheticDefaultImports?: boolean;
    allowUnreachableCode?: boolean;
    allowUnusedLabels?: boolean;
    alwaysStrict?: boolean;
    baseUrl?: string;
    charset?: string;
    checkJs?: boolean;
    declaration?: boolean;
    declarationDir?: string;
    disableSizeLimit?: boolean;
    downlevelIteration?: boolean;
    emitBOM?: boolean;
    emitDecoratorMetadata?: boolean;
    experimentalDecorators?: boolean;
    forceConsistentCasingInFileNames?: boolean;
    importHelpers?: boolean;
    inlineSourceMap?: boolean;
    inlineSources?: boolean;
    isolatedModules?: boolean;
    lib?: string[];
    locale?: string;
    mapRoot?: string;
    maxNodeModuleJsDepth?: number;
    module?: string;
    moduleResolution?: string;
    newLine?: string;
    noEmit?: boolean;
    noEmitHelpers?: boolean;
    noEmitOnError?: boolean;
    noErrorTruncation?: boolean;
    noFallthroughCasesInSwitch?: boolean;
    noImplicitAny?: boolean;
    noImplicitReturns?: boolean;
    noImplicitThis?: boolean;
    noStrictGenericChecks?: boolean;
    noUnusedLocals?: boolean;
    noUnusedParameters?: boolean;
    noImplicitUseStrict?: boolean;
    noLib?: boolean;
    noResolve?: boolean;
    out?: string;
    outDir?: string;
    outFile?: string;
    paths?: { [key: string]: string[] };
    preserveConstEnums?: boolean;
    project?: string;
    reactNamespace?: string;
    jsxFactory?: string;
    removeComments?: boolean;
    rootDir?: string;
    rootDirs?: string[];
    skipLibCheck?: boolean;
    skipDefaultLibCheck?: boolean;
    sourceMap?: boolean;
    sourceRoot?: string;
    strict?: boolean;
    strictNullChecks?: boolean;
    suppressExcessPropertyErrors?: boolean;
    suppressImplicitAnyIndexErrors?: boolean;
    target?: string;
    traceResolution?: boolean;
    types?: string[];
    /** Paths used to compute primary types search locations */
    typeRoots?: string[];
    [option: string]: any | undefined;
  };
  files?: string[];
  exclude?: string[];
  include?: string[];
  angularCompilerOptions?: {
    genDir?: string;
    basePath?: string;
    skipMetadataEmit?: boolean;
    strictMetadataEmit?: boolean;
    skipTemplateCodegen?: boolean;
    flatModuleOutFile?: string;
    flatModuleId?: string;
    generateCodeForLibraries?: boolean;
    annotateForClosureCompiler?: boolean;
    annotationsAs?: 'decorators' | 'static fields';
    trace?: boolean;
    debug?: boolean;
    enableLegacyTemplate?: boolean;
  };
  bundlerOptions?: {
    entry?: string;
    outDir?: string;
    externals?: ExternalModules<string>;
    externalModules?: ExternalModules<string | AdvancedExternalModule> | false;
  };
}

export interface NodePackage {
  name: string;
  version?: string;
  description?: string;
  author?: string;
  private?: boolean;
  main?: string;
  module?: string;
  es2015?: string;
  typings?: string;
  license?: string;
  scripts?: { [command: string]: string };
  dependencies?: { [pkg: string]: string };
  devDependencies?: { [pkg: string]: string };
  peerDependencies?: { [pkg: string]: string };
  keywords?: string[];

  [misc: string]: any;
}

export interface ExternalModules<T> {
  [moduleName: string]: T;
}

export interface AdvancedExternalModule {
  commonJsName: string;
  namedExports?: string[];
}
