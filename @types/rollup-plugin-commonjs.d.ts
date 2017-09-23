declare module 'rollup-plugin-commonjs' {
  import { Plugin } from 'rollup';

  type ignoreFunc = (id: string) => boolean;

  const ModuleInterface: {
    (params?: {
      // non-CommonJS modules will be ignored, but you can also
      // specifically include/exclude files
      include?: string,  // Default: undefined
      exclude?: string,  // Default: undefined
      // these values can also be regular expressions
      // include: /node_modules/

      // search for files other than .js files (must already
      // be transpiled by a previous plugin!)
      extensions?: string[],  // Default: [ '.js' ]

      // if true then uses of `global` won't be dealt with by this plugin
      ignoreGlobal?: boolean,  // Default: false

      // if false then skip sourceMap generation for CommonJS modules
      sourceMap?: boolean,  // Default: true

      // explicitly specify unresolvable named exports
      // (see below for more details)
      namedExports?: { [fileName: string]: string[] },  // Default: undefined

      // sometimes you have to leave require statements
      // unconverted. Pass an array containing the IDs
      // or a `id => boolean` function. Only use this
      // option if you know what you're doing!
      ignore?: string[] | ignoreFunc;

    }): Plugin;
  }

  export = ModuleInterface;
}
