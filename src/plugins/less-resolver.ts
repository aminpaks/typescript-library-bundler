import * as path from 'path';
import * as less from 'less';
import { isFile, readFile } from '../utils';

const dynamicFilePathRegEx = /^~\/?(.*\.(?:less|css|svg|tff|png|jpe?g|))$/i;

export interface ResolveResult {
  contents: string | undefined;
  filename: string;
}

export class NmpFileManager extends less.FileManager {
  constructor(private nodeModulePaths: string[] = []) {
    super();
  }

  private resolveFile(filename: string): ResolveResult {
    const filePath = filename.replace(dynamicFilePathRegEx, '$1');

    let fileFullPath = '';

    for (const currentNodePath of this.nodeModulePaths) {
      fileFullPath = path.resolve(currentNodePath, filePath);

      if (isFile(fileFullPath)) {
        return {
          contents: readFile(fileFullPath),
          filename: fileFullPath,
        };
      }
    }

    return {
      contents: undefined,
      filename,
    };
  }

  supports(filename: string /*, currentDirectory: string, options, environment */): boolean {
    return this.nodeModulePaths.length > 0 && dynamicFilePathRegEx.test(filename);
  }

  supportsSync(filename: string): boolean {
    return this.nodeModulePaths.length > 0 && dynamicFilePathRegEx.test(filename);
  }

  loadFile(filename: string /* , currentDirectory: string, options, environment */): Promise<ResolveResult> {
    return Promise.resolve(this.resolveFile(filename));
  }

  loadFileSync(filename: string): ResolveResult {
    return this.resolveFile(filename);
  }
}

export function LessResolver({
  nodeModulePaths,
}: {
    nodeModulePaths: string[];
  }) {
  return {
    install(_lessInstance: any, pluginManager: any) {
      pluginManager.addFileManager(new NmpFileManager(nodeModulePaths));
    },
    minVersion: [2, 1, 1],
  };
}
