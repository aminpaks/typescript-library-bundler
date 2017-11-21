import * as path from 'path';
import { BundlerPluginsOptions } from './types';
import { FileHandler } from './file';
import { InlineStyles } from './plugins/inline-styles';
import { InlineTemplate } from './plugins/inline-template';

export interface HandlerPlugin {
  (file: FileHandler, projectDir: string, pluginsOptions: BundlerPluginsOptions): Promise<string>;
}

export async function preprocessTSFiles(entryFilePath: string, destDir: string, projectDir: string, pluginsOptions: BundlerPluginsOptions): Promise<FileHandler[]> {
  const allFiles = await getFiles(entryFilePath, []);

  const plugins = [InlineTemplate, InlineStyles];

  for (const file of allFiles) {
    for (const plugin of plugins) {
      const newContent = await plugin(file, projectDir, pluginsOptions);

      if (newContent != file.content) {
        file.setContent(newContent);
      }
    }

    const currentPath = file.filePath;
    const destPath = currentPath.replace(projectDir + path.sep, '');
    const absDestPath = path.resolve(destDir, destPath);

    file.copyTo(absDestPath);
  }

  return allFiles;
}

async function getFiles(entryFilePath: string, _excludeList: string[]): Promise<FileHandler[]> {
  const entryFile = new FileHandler(entryFilePath);
  const excludeFromList: string[] = [entryFilePath];
  return [entryFile, ...await entryFile.getImportees(excludeFromList)];
}
