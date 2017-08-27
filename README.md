[![npm version](https://badge.fury.io/js/typescript-library-bundler.svg)](https://badge.fury.io/js/typescript-library-bundler)
[![downloads](https://img.shields.io/npm/dm/typescript-library-bundler.svg)](https://npmjs.org/package/typescript-library-bundler)
[![circle-ci](https://circleci.com/gh/aminpaks/typescript-library-bundler/tree/master.svg?style=shield&circle-token=fb6b66aca044ec66bb079fe4d3e5f1ce17109c83)](https://circleci.com/gh/aminpaks/typescript-library-bundler/tree/master)

## Typescript Library Bundler

With help of this library you can bundle your typescript library and make it ready to ship with ES5 or any other version of ECMAScript.

Good news is you can bundle your Angular library as well, it will inline your styles & template automatically. Right now it supports `LESS`, `SCSS` and `CSS` for styles of Angular components.

## Installation
Let's get started by installing it from [npm repository](https://www.npmjs.com/package/typescript-library-bundler)
```sh
$ npm install --save-dev typescript-library-bundler
```
or from [yarn repository](https://yarnpkg.com/en/package/typescript-library-bundler)
```sh
$ yarn add --dev typescript-library-bundler
```

## Usage
Typescript Library Bundler works out of box without setting anything up. You just need to add your public API entry file into your `tsconfig.json`:

**tsconfig.json** inside of your project

```json
{
  "files": [
    "./src/public_api.ts"
  ]
}
```

And you're ready to go, just run it either from your package scripts:

**package.json** inside of your project

```json
{
  "scripts": {
    "build": "tsb"
  }
}
```
and run it from shell:
```sh
$ npm run build
```
or simply by executing it from bin folder of your project:
```sh
$ ./node_modules/.bin/tsb --project ./
```

## CLI Parameters
The cli tool can receive your project path or its tsconfig by passing it as an argument of `p` or `project` as `tsb -p ./tsconfig-build.json` or `tsb --project ../`


## Contributes
To debug follow these steps:
1. Clone the project `git clone https://github.com/aminpaks/typescript-library-bundler`
2. Install dependencies `cd typescript-library-bundler && yarn install`
4. Run debugger from debug section of vscode `Debug integration`

To verify & build:
1. Run `yarn run verify`
2. Run `yarn run build`
