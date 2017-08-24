/**
 * @license Typescript-Debug-Script
 * (c) 2017 Amin Paks <amin.pakseresht@hotmail.com>
 * License: MIT
 */
const path = require('path');
const argv = require('yargs').argv;

const entry = argv.entry;

if (typeof entry === 'string') {
  const entryFile = path.resolve(process.cwd(), entry.replace(/['"]/g, ''));
  const entryModule = entryFile.replace(/\.ts$/i, '');
  const extName = path.extname(entryFile);

  if (extName === '.ts') {
    const configFile = argv.tsconfig;

    require('ts-node').register({
      compilerOptions: {
        target: 'es5',
        module: 'commonjs',
        sourceMap: true,
        lib: [
          'es2017',
        ]
      },
    });

    require(entryModule);
  }
} else {
  console.log('--entry argument is not a typescript file!');
}
