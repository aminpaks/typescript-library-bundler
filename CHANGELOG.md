# typescript-library-bundler changelog

## 0.2.1

* Fixes a minor bug in source-maps

## 0.2.0

* Introduces new arguments in CLI:
  * `--outDir` or `-o` is a relative path to project to emit the result (e.g: `--outDir ./build`)
  * `--noClean` or `-k` turns off cleaning bundle directory
  * `--noPkgValidation` or `-g` turns off validating package
  * `--noDepsValidation` or `-d` turns off validating dependency packages

## 0.1.7

* Fixes LessCompiler issue not being able to resolve URL starting with tilde ([#10](https://github.com/aminpaks/typescript-library-bundler/issues/10))

## 0.1.6

* Fixes small bug in merging original tsconfig to compiler configuration ([#9](https://github.com/aminpaks/typescript-library-bundler/issues/9))

## 0.1.5

* Fixes small bug in CLI

## 0.1.4

* Fixes some minor issues
* Forces greater v6.5.0 of node as engine

## 0.1.2

* Commented import/export statements reports incorrectly ([#7](https://github.com/aminpaks/typescript-library-bundler/pull/7))

## 0.1.1

* Comments in template of Angular components breaks the process ([#5](https://github.com/aminpaks/typescript-library-bundler/pull/5))

## 0.1.0

* Finds external modules automatically ([#3](https://github.com/aminpaks/typescript-library-bundler/pull/3))
