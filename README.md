[![npm version](https://badge.fury.io/js/typescript-library-bundler.svg)](https://badge.fury.io/js/typescript-library-bundler)
[![downloads](https://img.shields.io/npm/dm/typescript-library-bundler.svg)](https://npmjs.org/package/typescript-library-bundler)
[![circle-ci](https://circleci.com/gh/aminpaks/typescript-library-bundler/tree/master.svg?style=shield&circle-token=fb6b66aca044ec66bb079fe4d3e5f1ce17109c83)](https://circleci.com/gh/aminpaks/typescript-library-bundler/tree/master)

## Typescript Library Bundler

With help of this tool you can bundle your typescript library to javascript and make it ready to ship for ES6, ES5, CommonJS and UMD.

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
| externalModules | `object` or `false` | `{ lodash: "_" }` | An object to define the external modules that your library is consuming. Refer to External Libraries for more info.

## External Libraries (Experimental)
This happens often that libraries such as lodash or any other node modules are being used to facilitate the process of development. You have two choices to deal with external libraries/modules:
1. You make these libs/modules dependencies and they must be imported along with your library once they are being consumed by an app. Currently bundler using an algorithm to **automatically** find these external modules inside of your library's source code. And you don't need to do anything, but in case that something went wrong you can define them explicitly for bundler.   
Create a new section called `externalModules` in `bundlerOptions` and define them manually as following example:
    ```json
    {
      "bundlerOptions": {
        ...
        "externalModules": {
          "angular2-jwt": "angular2JWT",
          "lodash": "_"
        }
      }
    }
    ```
    **Note:** Since v0.1.0 this is the default behaviour and all imported node modules are treated as external.  
    **Info:** The key (for example `lodash`) is the name of module and the value (in this example underscore -> `_`) is the name used to define the module in CommonJS build that will be included only for UMD bundles. 

 2. You want to include their source with your code and ship them all together.   
  Set `false` to `externalModules` to include all imported node modules. Bundler will import all these libs/modules and include them all in your library output bundle:
    ```json
    {
      "bundlerOptions": {
        ...
        "externalModules": false
      }
    }
    ```
    Or in case you want to pick set `false` only to those that you want to ship them with your library
    ```json
    {
      "bundlerOptions": {
        ...
        "externalModules": {
          "lodash": false // Only lodash will be included
        }
      }
    }
    ```
    **Important note:** This feature won't work well with CommonJs modules. In case that you faced an error message saying a specific element is not exported by a module you may defined them based on [Rollup CommonJs plugin](https://github.com/rollup/rollup-plugin-commonjs) as following example:
    ```json
    {
      "bundlerOptions": {
        ...
        "externalModules": false,
        "commonJsSettings": {
          "namedExports": {
            "lodash": ["chain", "merge"]
          }
        }
      }
    }
    ```

 
## CLI Parameters
Here is the list of all available arguments that CLI accepts with their descriptions:

| Argument | Shorthand | Description |
| -------- | :-------: | ----------- |
| project | p | Either the project path (with a default `tsconfig.json`) or a path to a `tsconfig-build.json` |
| outDir  | o | A relative path that bundler will emit the result |
| noClean | k | Disable cleaning the out directory before each compilation |
| noPkgValidation | g | Disable the warnings for incorrect entries of package.json |
| noDepsValidation | d | Disable the warnings for missing dependencies |

Note: TSB would work without passing any arguments as well. It will look for a `tsconfig.json` in the current working directory.

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
