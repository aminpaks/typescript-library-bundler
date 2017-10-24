import * as path from 'path';
import { assert } from 'chai';
import {
  copyFromTo,
  ensureMakeDir,
  ensureRemoveDir,
  isArray,
  isDirectory,
  isEmpty,
  isFile,
  isNil,
  isString,
  mergeInto,
  readFile,
  removeComments,
  writeFile,
} from '../src/utils';

describe('utils', () => {
  it('isNil', () => {
    assert.equal(isNil(undefined), true);
    assert.equal(isNil(null), true);
    assert.equal(isNil(void 0), true);
    assert.equal(isNil([]), false);
    assert.equal(isNil({}), false);
  });

  it('isString', () => {
    assert.equal(isString(''), true);
    assert.equal(isString([]), false);
  });

  it('isArray', () => {
    assert.equal(isArray([]), true);
    assert.equal(isArray(Array(0)), true);
    assert.equal(isArray({}), false);
    assert.equal(isArray(''), false);
    assert.equal(isArray(undefined), false);
  });

  it('isEmpty', () => {
    assert.equal(isEmpty([]), true);
    assert.equal(isEmpty([0]), false);
    assert.equal(isEmpty(Array(0)), true);
    assert.equal(isEmpty(Array(1)), false);
    assert.equal(isEmpty({}), true);
    assert.equal(isEmpty({ a: 1 }), false);
    assert.equal(isEmpty(''), true);
    assert.equal(isEmpty('a'), false);
  });

  it('mergeInto', () => {
    assert.deepEqual(mergeInto({ level1: true }, { level1: false }), { level1: true });
    assert.deepEqual(mergeInto({ level1: [true] }, { level1: [false] }), { level1: [false, true] });
    assert.deepEqual(mergeInto({ lib: ['a'] }, { check: true }), { lib: ['a'], check: true });
    assert.notDeepEqual(mergeInto({
      level1: {
        level2: [true],
      },
    }, { level1: {} }), { level1: { level2: {} } });
  });

  it('isFile', () => {
    assert.equal(isFile(path.resolve(__dirname, 'file.spec.js')), true);
    assert.equal(isFile(path.resolve(__dirname)), false);
  });

  it('isDirectory', () => {
    assert.equal(isDirectory(path.resolve(__dirname)), true);
    assert.equal(isDirectory(path.resolve(__dirname, 'file.spec.js')), false);
  });

  const emptyDir = path.resolve(__dirname, 'empty-dir');
  const subFolder = path.resolve(__dirname, 'empty-dir', 'sub-folder');
  it('ensureMakeDir', () => {
    ensureMakeDir(subFolder);
    assert.equal(isDirectory(emptyDir), true);
    assert.equal(isDirectory(subFolder), true);
  });

  const sampleFile = path.join(subFolder, 'sample-file.js');
  const sampleFileContent = 'THIS IS A SAMPLE FILE -- DO NOT REMOVE!';
  it('writeFile/readFile', () => {
    writeFile(sampleFile, sampleFileContent);
    assert.equal(readFile(sampleFile), sampleFileContent);
  });

  it('copyFromTo', () => {
    return copyFromTo({ pattern: 'sample-file.js', rootDir: subFolder, toDir: emptyDir })
      .then(() => {
        const sampleFileNewPath = path.resolve(emptyDir, 'sample-file.js');
        assert.equal(isFile(sampleFileNewPath), true);
      });
  });

  it('ensureRemoveDir', () => {
    ensureRemoveDir(emptyDir);
    assert.equal(isDirectory(emptyDir), false);
  });

  it('removeComments', () => {
    const sampleCode = `
const x = 100;//Single line comment
/**
 * Multiline comment
 * With a tail */
alert(/* inline comment */ 'check');
    `;
    const sampleCodeWithoutComment = `
const x = 100;

alert( 'check');
    `;
    const removedCommentFromSampleCode = removeComments(sampleCode);

    assert.equal(sampleCodeWithoutComment, removedCommentFromSampleCode);
  });
});
