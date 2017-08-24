/**
 * @license Utils
 * (c) 2017 Amin Paks <amin.pakseresht@hotmail.com>
 * License: MIT
 */

import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';

export function copyFromTo({ pattern, rootDir, toDir, excludes = [] } : {
  pattern: string;
  rootDir: string;
  toDir: string;
  excludes?: string[];
}): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
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
            resolve(true);
          }
        })
        .catch((err_1) => {
          reject(err_1);
        });
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
    return Object.keys(value).length === 0;
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
  for (const key of Object.keys(from)) {

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

export function mergeInto<T, U>(origin: T, dest: U): T & U {
  return mergeLevelFromTo(origin, dest);
}
