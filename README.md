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
Typescript Library Bundler works out of box without setting anything up. Follow steps below to achieve this, it will take less that a minute:
1. Create a new tsconfig for your builds (you may call it anything such as `tsconfig.build.json`) or keep your default
2. Add `bundlerOptions` key to the tsconfig and point to a barrel file that exports the implementation of your library (and extend it if it's not the default tsconfig of your project):   

    **tsconfig.build.json**
    ```json
    {
      "extends": "./tsconfig.json", // Or a relative path to the default configs
      "bundlerOptions": {
        "entry": "./src/public_api.ts" // Do not call this barrel file "index.ts"
      }
    }
    ```

3. Add the `tsb` cli to `package.json` of your project:  

    **package.json**
    ```json
    {
      "name": "a-library",
      "version": "0.0.2",
      "scripts": {
        "build": "tsb -p tsconfig.build.json"
      }
    }
    ```
4. Run it from shell:
    ```sh
    $ npm run build
    ```
5. That's it!

## External Libraries (Experimental)
If you don't want TSB bundles used external libraries in your project you can create a new section in the build tsconfig and define them there. Note in that object key is the library's name and value will be only used for CommonJS to find them globally.
```json
{
  "bundlerOptions": {
    "entry": "./src/public_api.ts",
    "externals": {
      "angular2-jwt": "angular2JWT",
      "lodash": "_"
    }
  }
}
```

## CLI Parameters
The cli tool can receive your project path or its tsconfig by passing it as an argument of `p` or `project` as `tsb -p ./tsconfig-build.json` or `tsb --project ../`. If you don't provide `project` parameter it will try to load the current working directory and look for a `tsconfig.json`.

## Wiki
Read more information [here](https://github.com/aminpaks/typescript-library-bundler/wiki).

## Contributes
To debug follow these steps:
1. Clone the project `git clone https://github.com/aminpaks/typescript-library-bundler`
2. Install dependencies `cd typescript-library-bundler && yarn install`
4. Run debugger from debug section of vscode `Debug integration`

To verify & build:
1. Run `yarn run verify`
2. Run `yarn run build`
