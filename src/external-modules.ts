import * as path from 'path';
import * as camelcase from 'camelcase';
import { FileHandler } from './file';
import { ExternalModules } from './types';
import {
  isDirectory,
  uniqueArray,
} from './utils';

export interface RollupCommonJsNamedExport {
  [moduleName: string]: string[];
}

export async function getExternalModuleNames(fileList: FileHandler[], projectPath: string, predefined: ExternalModules = {}): Promise<ExternalModules> {

  const externalModuleNames: ExternalModules = {};
  const nodeModulePaths = await resolveNodeModulePaths(projectPath);

  const potentialExternalModules = fileList.reduce((allModuleNames, aFile) =>
    uniqueArray(allModuleNames, aFile.getExternalModules()), []);

  const uniqueModuleNames = uniqueArray(potentialExternalModules, Object.keys(predefined));

  for (const moduleName of uniqueModuleNames) {
    if (isModuleAvailable(moduleName, nodeModulePaths)) {
      externalModuleNames[moduleName] = predefined[moduleName] || convertModuleToCommonJs(moduleName);
    } else {
      throw Error(`Could not find module "${moduleName}". Did you install it?\nWe looked in:\n${nodeModulePaths.join('\n')}`); // `;
    }
  }

  return externalModuleNames;
}

export function convertModuleToCommonJs(moduleName: string): string {
  return moduleName
    .replace(/^@/, '')
    .split(/[\/\\]/)
    .map(part => camelcase(part))
    .join('.')
    .replace(/angular/i, 'ng');
}

export async function nodeModuleExist(absPath: string): Promise<string | false> {
  const nodeModulePath = path.resolve(absPath, 'node_modules');

  if (isDirectory(nodeModulePath)) {
    return nodeModulePath;
  }

  return false;
}

export async function resolveNodeModulePaths(searchInPath: string): Promise<string[]> {
  let nodeModulePaths: string[] = [];
  const currentPathNodeModule = await nodeModuleExist(searchInPath);

  if (currentPathNodeModule !== false) {
    nodeModulePaths = uniqueArray(nodeModulePaths, [currentPathNodeModule]);
  }

  const parentDir = path.dirname(searchInPath);

  if (parentDir !== '/') {
    nodeModulePaths = uniqueArray(nodeModulePaths, await resolveNodeModulePaths(parentDir));
  }

  return nodeModulePaths;
}

export async function isModuleAvailable(moduleName: string, nodeModulePaths: string[]): Promise<boolean> {
  return nodeModulePaths.some(aPath => isDirectory(path.resolve(aPath, moduleName)));
}

export function isExternalModule(externalModules: ExternalModules, idOrPathToTest: string): boolean {
  return Object.keys(externalModules).some(moduleName => {
    const moduleNamePattern = '^' + moduleName.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&');
    return (new RegExp(moduleNamePattern)).test(idOrPathToTest);
  });
}
