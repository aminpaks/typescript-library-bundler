import * as path from 'path';
import * as sass from 'node-sass';
import { isEmpty, isNil } from '../utils';

export function replaceModulesPath(content: string, currentDir: string, projectRootDir: string): string {
  const importRE = /(@import\s*(\([^\)]+\)\s*)?(?:['"])(~))\w/gi;

  let match: RegExpMatchArray | null;

  while ((match = importRE.exec(content)) && !isNil(match)) {
    const currentStatement = match[0];
    const tilde = match[3];
    const pathToModules = path.join(path.relative(currentDir, projectRootDir), 'node_modules') + path.sep;

    const newStatement = currentStatement.replace(tilde, pathToModules);

    content = content.replace(currentStatement, newStatement);
  }

  return content;
}

export async function renderSass(content: string, currentDir: string, projectRootDir: string): Promise<string> {
  let result = '';

  try {
    const replacedPathsContent = replaceModulesPath(content, currentDir, projectRootDir);
    const sassResult = sass.renderSync({
      data: replacedPathsContent,
    });
    result = sassResult.css.toString();
  } catch (err) {
    throw new Error(`Less compiler ${err.message}\n\nWhile compiling => "${content}`);
  }

  return result;
}
