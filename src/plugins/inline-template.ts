import * as path from 'path';
import { minify } from 'html-minifier';
import { FileHandler } from '../file';
import { HandlerPlugin } from '../preprocess-files';
import {
  isEmpty,
  isFile,
  isNil,
  readFile,
} from '../utils';

export const InlineTemplate: HandlerPlugin = async (file: FileHandler): Promise<string> => {
  const templateUrlsRE = /((templateUrl\s*):\s*(?:([`'"])(.*)\3))/gi;
  let content = file.content;

  if (isEmpty(content) || templateUrlsRE.test(content) === false) {
    return content;
  }

  let match: RegExpMatchArray | null;
  templateUrlsRE.lastIndex = 0;
  while ((match = templateUrlsRE.exec(content)) && !isNil(match)) {

    if (isNil(match.index) ||  match.index < 0) {
      continue;
    }

    const quote = match[3];
    const templateFilename = match[4];
    const templateFilePath = path.resolve(file.dirPath, templateFilename);

    if (!isFile(templateFilePath)) {
      return file.content;
    }

    const templateContent = readFile(templateFilePath);
    const minifiedTemplate = minify(templateContent, {
      caseSensitive: true,
      collapseWhitespace: true,
    }).replace(new RegExp(quote, 'g'), '\\' + quote);

    const templateReplacement = match[0].replace(match[4], minifiedTemplate).replace(match[2], 'template');
    content = content.replace(match[0], templateReplacement);
  }

  return content;
};
