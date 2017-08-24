import * as path from 'path';
import {
  ensureMakeDir,
  isDirectory,
  isEmpty,
  isFile,
  isNil,
  readFile,
  writeFile,
} from './utils';

export class FileHandler {
  private _content: string;
  private importModuleRE = /(?:import|export)\s*(?:(?:\{[^}]*\}|\*|\w+)(?:\s*as\s+\w+)?(?:\s+from)?\s*)?([`'"])((?:\\[\s\S]|(?!\1)[^\\])*?)\1/ig;

  public dirPath: string;

  constructor(public filePath: string) {
    this.dirPath = path.dirname(filePath);
  }

  get content(): string {
    if (isNil(this._content)) {
      this._content = readFile(this.filePath);
    }

    return this._content;
  }

  private resolveToFile(validPath: string): string {
    if (isDirectory(validPath)) {
      validPath = path.join(validPath, 'index.ts');
    } else if (path.extname(validPath) !== '.ts') {
      validPath += '.ts';
    }
    return validPath;
  }

  private getImporteeNames(): string[] {
    const allModules: string[] = [];
    const importModuleMatchFileIndex = 2;
    let importModuleMatch: RegExpMatchArray | null;

    // Reset current index to 0
    // RegEx.test moves this into 1
    this.importModuleRE.lastIndex = 0;
    const content = this.content;

    importModuleMatch = this.importModuleRE.exec(content);
    while (!isNil(importModuleMatch)) {
      /**
       * Adds the file from match to result
       * import * as x from './a-module'; => will get "./a-module"
       */
      allModules.push(importModuleMatch[importModuleMatchFileIndex]);
      importModuleMatch = this.importModuleRE.exec(content);
    }

    return allModules;
  }

  private async getImporteeFiles(excludeFrom: string[]): Promise<FileHandler[]> {
    return await this.getImporteeNames()
      .map((moduleName) => path.resolve(this.dirPath, moduleName))
      .map((resolvedPath) => this.resolveToFile(resolvedPath))
      .filter((resolvedFilePath) => isFile(resolvedFilePath))
      .filter((resolvedFilePath) => (isEmpty(excludeFrom) || excludeFrom.indexOf(resolvedFilePath) < 0))
      .map(resolvedFilePath => new FileHandler(resolvedFilePath));
  }

  public setContent(content: string): void {
    this._content = content;
  }

  public copyTo(destFilePath: string): void {
    const dirPath = path.dirname(destFilePath);
    ensureMakeDir(dirPath);
    writeFile(destFilePath, this.content);
  }

  public hasImporters(): boolean {
    this.importModuleRE.lastIndex = 0;
    return this.importModuleRE.test(this.content);
  }

  public async getImportees(excludeFrom: string[]): Promise<FileHandler[]> {
    const importeeFiles = await this.getImporteeFiles(excludeFrom);

    if (isEmpty(importeeFiles)) {
      return [];
    }

    excludeFrom.push(...importeeFiles.map(file => file.filePath));

    const allImportees = [...importeeFiles];
    for (const file of importeeFiles) {
      const currentFileImportees = await file.getImportees(excludeFrom);

      if (!isEmpty(currentFileImportees)) {
        allImportees.push(...currentFileImportees);
        excludeFrom.push(...currentFileImportees.map(moduleFile => moduleFile.filePath));
      }
    }

    return allImportees;
  }
}
