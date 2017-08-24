import * as cleanCss from 'clean-css';
import { isArray } from '../utils';

export async function minifyCSS(content: string, options?: cleanCss.Options): Promise<string> {
  const cleaner = new cleanCss(options);
  const result = cleaner.minify(content);

  if (isArray(result.errors) && result.errors.length > 0) {
    throw new Error(result.errors.join('\n\r'));
  }

  return result.styles;
}
