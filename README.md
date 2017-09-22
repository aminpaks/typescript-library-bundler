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

## Bundler options
We added a new section `bundlerOptions` in `tsconfig` to prevent creating any conflicts with Typescript compiler or any other tools options. Following options are available:

| Option  | Type | Example | Description |
| ------- | :--: | :------ | :---------- |
| entry | `string` | `./src/public_api.ts` | This is how bundler starts looking for modules and implementation of the library. It will go through all the imports/exports of the lib and find these statements.
| outDir | `string` | `./dist` | A relative path to project path to output the bundle results
| externals | `object` | `{ lodash: "_" }` | An object to define the external modules that your library is consuming. Refer to External Libraries for more info.

## External Libraries (Experimental and will be changed)
This happens often that libraries such as lodash are being used to facilitate the process of development. You have two choices to deal with external libraries:
1. You want to include these libs with your code and ship them all together. In this case you do nothing and let bundler include them automatically
2. You make them dependencies and they must be imported along with your library once they are being consumed by an app:
  Create a new section `externals` in `bundlerOptions` and defined them as following example:
    ```json
    {
      "bundlerOptions": {
        ...
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
