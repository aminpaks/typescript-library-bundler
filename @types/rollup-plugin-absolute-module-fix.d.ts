declare module 'rollup-plugin-absolute-module-fix' {
  import { Plugin } from 'rollup';

  const ModuleInterface: {
    (): Plugin;
  }

  export = ModuleInterface;
}
