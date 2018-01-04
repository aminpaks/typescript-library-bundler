/**
 * @license Utils
 * (c) 2017 Amin Paks <amin.pakseresht@hotmail.com>
 * License: MIT
 */

import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import { ExternalModules } from './types';

const { keys } = Object;

export function copyFromTo({ pattern, rootDir, toDir, excludes = [] }: {
  pattern: string;
  rootDir: string;
  toDir: string;
  excludes?: string[];
}): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    glob(pattern, {
      cwd: rootDir,
      nodir: true,
      ignore: ['node_modules/**/*'].concat(excludes),
    }, (err: Error, files: string[]) => {

      // Rejects on error
      if (err) {
        reject(err);
      }

      const results = files.map(file => {
        return new Promise<string>((fileResolve, fileReject) => {
          const origin = path.join(rootDir, file);
          const dest = path.join(toDir, file);

          const rd = fs.createReadStream(origin);
          rd.on('error', (err_1) => fileReject(`Cannot read ${origin}: ${err_1}`));
          rd.on('open', () => {
            ensureMakeDir(path.dirname(dest));

            const wr = fs.createWriteStream(dest);
            wr.on('error', (err_1) => fileReject(`Cannot write to ${dest}: ${err_1}`));
            wr.on('close', () => fileResolve(file));

            // Finish the copy
            rd.pipe(wr);
          });
        });
      });

      Promise.all(results)
        .then((values) => {
          if (values.length === files.length) {
            resolve(values);
          } else {
            const notCopied = files.filter(file => !values.includes(file));
            reject('Not all files were copied.\n' + notCopied.join('\n'));
          }
        })
        .catch((err_1) => {
          reject(err_1);
        });
    });
  });
}

export function findFiles(pattern: string, options: glob.IOptions = {}): Promise<string[]> {
  return new Promise((resolve, reject) => {
    glob(pattern, { ...options }, (err, files) => {

      if (!isNil(err)) {
        reject(new Error(err.message + (err.stack ? '\n\n' + err.stack : null)));
      }

      resolve(files);
    });
  });
}

export function readFile(filePath: string, encoding?: string): string {
  return fs.readFileSync(filePath, { encoding: encoding || 'utf8' });
}

export function writeFile(filePath: string, content: string, encoding?: string): void {
  return fs.writeFileSync(filePath, content, { encoding: encoding || 'utf8' });
}

export function isDirectory(validPath: string): boolean {
  try {
    return fs.lstatSync(validPath).isDirectory();
  } catch (err) {
    return false;
  }
}

export function isFile(validPath: string): boolean {
  try {
    return fs.lstatSync(validPath).isFile();
  } catch (err) {
    return false;
  }
}

export function isString(value: any): value is string {
  return (typeof value === 'string');
}

export function isNil(value: any): value is null | undefined {
  return (value == undefined);
}

export function isEmpty(value: any): boolean {
  if (typeof value === 'string') {
    return value.length === 0;
  } else if (value instanceof Array) {
    return value.length === 0;
  } else if (typeof value === 'object') {
    return keys(value).length === 0;
  } else {
    return true;
  }
}

export function isArray(variable: any): variable is any[] {
  return (variable instanceof Array);
}

export function ensureMakeDir(validPath: string): void {
  if (!isDirectory(validPath)) {
    const parentPath = path.dirname(validPath);

    ensureMakeDir(parentPath);

    fs.mkdirSync(validPath);
  }
}

export function ensureRemoveDir(validPath: string): void {
  if (isDirectory(validPath)) {
    const dirItems = fs.readdirSync(validPath, 'utf8');

    for (const item of dirItems) {
      const currentItem = path.resolve(validPath, item);

      if (isDirectory(currentItem)) {
        ensureRemoveDir(currentItem);
      } else if (isFile(currentItem)) {
        fs.unlinkSync(currentItem);
      }
    }

    fs.rmdirSync(validPath);
  }
}

export function mergeLevelFromTo(from: any, to: any): any {
  const result: any = { ...to };
  for (const key of keys(from)) {

    if (isArray(from[key])) {
      const fromArray: any[] = from[key];

      if (isArray(result[key])) {
        const toArray: any[] = result[key];

        result[key] = toArray
          .filter(item => fromArray.indexOf(item) < 0)
          .concat(fromArray);
      } else {

        result[key] = [...fromArray];
      }
    } else if (typeof from[key] === 'object') {

      result[key] = mergeLevelFromTo(from[key], result[key]);
    } else {

      result[key] = from[key];
    }
  }

  return result;
}

export type uniqueArrayPredicate<T> = (item: T, searchIn: T[]) => boolean;

export function uniqueArray<T>(unique: T[], second: T[], predicate: uniqueArrayPredicate<T> = (item: T, searchIn: T[]) => !searchIn.includes(item)): T[] {
  return unique.concat(...second.filter(item => predicate(item, unique)));
}

export function mergeInto<T, U>(origin: T, dest: U): T & U {
  return mergeLevelFromTo(origin, dest);
}

export function removeComments(input: string): string {
  const removedMultilineComments = input.replace(/\/\*(.|[\r\n])*?\*\//g, '');
  const removedSingleLineComments = removedMultilineComments.replace(/\/\/.*/gm, '');

  return removedSingleLineComments;
}

export function isAngularLib(externals: ExternalModules): boolean {
  return keys(externals).some(item => /^@angular/i.test(item));
}

export function isOfType<T>(_value: any, check: (value: any) => boolean): _value is T {
  return check && check(_value);
}


export function parseJSON<T = any>(value: string): T {
  try {
    return JSON.parse(value);

  } catch {
    return {} as T;
  }
}

export function clearError(err: any): string {
  const message = err.stack || err.message || err;

  debugger;

  return message;
}
