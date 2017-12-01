/**
 * @license Typescript-Debug-Script
 * (c) 2017 Amin Paks <amin.pakseresht@hotmail.com>
 * License: MIT
 */
const path = require('path');
const minimist = require('minimist');

const argv = minimist(process.argv.splice(2));
const entry = argv.entry;

if (typeof entry === 'string') {
  const entryFile = path.resolve(process.cwd(), entry.replace(/['"]/g, ''));
  const entryModule = entryFile.replace(/\.ts$/i, '');
  const extName = path.extname(entryFile);

  if (extName === '.ts') {
    const configFile = argv.tsconfig;

    require('ts-node').register({
      compilerOptions: {
        target: 'es2016',
        module: 'commonjs',
        sourceMap: true,
        noUnusedLocals: false,
        noUnusedParameters: false,
        noImplicitAny: false,
        noImplicitReturns: false,
        noImplicitThis: false,
        declaration: false,
        strict: false,
        strictNullChecks: false,
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
