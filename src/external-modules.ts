import * as path from 'path';
import * as camelcase from 'camelcase';
import { FileHandler } from './file';
import { ExternalModules } from './types';
import {
  isDirectory,
  isFile,
  uniqueArray,
} from './utils';

export interface RollupCommonJsNamedExport {
  [moduleName: string]: string[];
}

const { keys } = Object;

export async function getExternalModuleNames(fileList: FileHandler[], projectPath: string, predefined: ExternalModules<string | false> = {}): Promise<ExternalModules> {

  const externalModuleNames: ExternalModules = {};
  const nodeModulePaths = await resolveNodeModulePaths(projectPath);

  const potentialExternalModules = fileList.reduce<string[]>((allModuleNames, aFile) =>
    uniqueArray(allModuleNames, aFile.getExternalModules()), []);

  const uniqueModuleNames = uniqueArray(potentialExternalModules, keys(predefined))
    .filter(moduleName => predefined[moduleName] !== false);

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
  const { root } = path.parse(parentDir);

  if (parentDir !== root) {
    nodeModulePaths = uniqueArray(nodeModulePaths, await resolveNodeModulePaths(parentDir));
  }

  return nodeModulePaths;
}

export async function isModuleAvailable(moduleName: string, nodeModulePaths: string[]): Promise<boolean> {
  return nodeModulePaths.some(aPath => isFile(path.resolve(aPath, moduleName, 'package.json')));
}

export function isExternalModule(externalModules: ExternalModules, idOrPathToTest: string): boolean {
  return keys(externalModules).some(moduleName => {
    const moduleNamePattern = '^' + moduleName.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&');
    return (new RegExp(moduleNamePattern)).test(idOrPathToTest);
  });
}
