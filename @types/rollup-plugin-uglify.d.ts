declare module 'rollup-plugin-uglify' {
  import { Plugin } from 'rollup';

  interface SourceMap {
    filename: string;
    url: string;
  }

  interface Mangle {
    eval?: boolean;
    toplevel?: boolean;
    reserved?: string[];
    keep_fnames?: boolean;
    regex?: RegExp;
    keep_quoted?: boolean;
    builtins?: boolean;

    debug?: false | string;
  }

  interface Options {
    ie8?: boolean;
    mangle?: false | Mangle;
    warnings?: boolean | 'verbose';
    sourceMap?: false | SourceMap;
    toplevel?: boolean;
    nameCache?: any;
    parse?: { [option: string]: any };
    output?: { [option: string]: any };
    compress?: { [option: string]: any };
  }

  const ModuleInterface: {
    (options?: Options): Plugin;
  }

  export = ModuleInterface;
}
