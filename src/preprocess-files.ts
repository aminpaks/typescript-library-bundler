import * as path from 'path';
import { FileHandler } from './file';

import { InlineStyles } from './plugins/inline-styles';
import { InlineTemplate } from './plugins/inline-template';

export interface HandlerPlugin {
  (file: FileHandler): Promise<string>;
}

export async function preprocessTSFiles(entryFilePath: string, destDir: string, baseDir?: string): Promise<string[]> {
  const allFiles = await getFiles(entryFilePath, []);

  const plugins = [InlineTemplate, InlineStyles];
  const copiedFiles: string[] = [];

  for (const file of allFiles) {
    for (const plugin of plugins) {
      const newContent = await plugin(file);

      if (newContent != file.content) {
        file.setContent(newContent);
      }
    }

    const currentPath = file.filePath;
    const destPath = currentPath.replace(baseDir + path.sep, '');
    const absDestPath = path.resolve(destDir, destPath);

    file.copyTo(absDestPath);

    copiedFiles.push(absDestPath);
  }

  return copiedFiles;
}

async function getFiles(entryFilePath: string, _excludeList: string[]): Promise<FileHandler[]> {
  const entryFile = new FileHandler(entryFilePath);
  const excludeFromList: string[] = [entryFilePath];
  return [entryFile, ...await entryFile.getImportees(excludeFromList)];
}
