import * as path from 'path';
import { FileHandler } from '../file';
import { HandlerPlugin } from '../preprocess-files';
import {
  isEmpty,
  isFile,
  isNil,
  readFile,
} from '../utils';

import { minifyCSS } from './css-tools';
import { renderLess } from './less-render';
import { renderSass } from './sass-render';

export const InlineStyles: HandlerPlugin = async (file: FileHandler): Promise<string> => {
  const styleUrlsRE = /(styleUrls\s*):\s*\[([^\]]+)\]/gi;
  const StyleUrlsMatchFullIndex = 0;
  const StyleUrlsMatchStylesKeyIndex = 1;
  const StyleUrlsMatchArrayIndex = 2;
  const styleUrlsArrayElementsRE = /([`'"])((?:(?!\1)[\s\S])+)\1/g;
  const StyleUrlsArrayMatchFullIndex = 0;
  const StyleUrlsArrayMatchFileIndex = 2;
  let content = file.content;

  if (isEmpty(content) || styleUrlsRE.test(content) === false) {
    return content;
  }

  let styleUrlsMatch: RegExpMatchArray | null;
  styleUrlsRE.lastIndex = 0;
  while ((styleUrlsMatch = styleUrlsRE.exec(content)) && !isNil(styleUrlsMatch)) {

    const styleUrlsArray = styleUrlsMatch[StyleUrlsMatchArrayIndex];
    let styleUrlsArrayReplacements = styleUrlsArray;
    let styleUrlsArrayElementMatch: RegExpMatchArray | null;
    while ((styleUrlsArrayElementMatch = styleUrlsArrayElementsRE.exec(styleUrlsArray)) && !isNil(styleUrlsArrayElementMatch)) {

      const styleFilename = styleUrlsArrayElementMatch[StyleUrlsArrayMatchFileIndex];
      const styleFileExt = path.extname(styleFilename).toLowerCase();
      const styleFilePath = path.resolve(file.dirPath, styleFilename);

      if (!isFile(styleFilePath)) {
        continue;
      }

      let styleContent = readFile(styleFilePath);

      switch (styleFileExt) {
        case '.less':
          const lessResult = await renderLess(styleContent, file.dirPath, process.cwd());
          if (!isEmpty(lessResult)) {
            styleContent = lessResult;
          }
          break;

        case '.scss':
          const sassResult = await renderSass(styleContent, file.dirPath, process.cwd());
          if (!isEmpty(sassResult)) {
            styleContent = sassResult;
          }
          break;

        default:
          break;
      }

      styleContent = await minifyCSS(styleContent);

      /**
       * Replace current element of style urls array in styleUrlsArrayReplacements with css styles
       * ['./a-css-file.css'] => ['.css-class{background:blue}']
       */
      const currentStyleUrlsArrayElementFull = styleUrlsArrayElementMatch[StyleUrlsArrayMatchFullIndex];
      const currentStyleUrlsArrayElementReplacement = currentStyleUrlsArrayElementFull.replace(styleFilename, styleContent);
      styleUrlsArrayReplacements = styleUrlsArrayReplacements.replace(currentStyleUrlsArrayElementFull, currentStyleUrlsArrayElementReplacement);
    }

    /**
     * Replace all node replacements with style urls
     * styleUrls: ['./a-css-file.css'] => styles: ['./a-css-file.css']
     * then...
     * styles: ['./a-css-file.css'] => styleUrls: ['.css-class{background:blue}']
     */
    const currentStyleUrlsFull = styleUrlsMatch[StyleUrlsMatchFullIndex];
    const currentStyleUrlsStyleKey = styleUrlsMatch[StyleUrlsMatchStylesKeyIndex];
    const currentStyleUrlsReplacement = currentStyleUrlsFull.replace(currentStyleUrlsStyleKey, 'styles').replace(styleUrlsArray, styleUrlsArrayReplacements);
    content = content.replace(currentStyleUrlsFull, currentStyleUrlsReplacement);
  }

  return content;
};
