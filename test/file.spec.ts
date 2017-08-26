import * as path from 'path';
import { assert } from 'chai';
import { writeFile } from '../src/utils';
import { FileHandler } from '../src/file';

describe('FileHandler', () => {
  const tsFilePath = path.resolve(__dirname, 'sample.ts');
  const tsFilePath2 = path.resolve(__dirname, 'sample-2.ts');
  const tsFileContent = `
  import * as path from 'path';
  import check from './sample-2.ts';
  `;
  const tsFileContent2 = 'export const check = 2;';

  writeFile(tsFilePath, tsFileContent);
  writeFile(tsFilePath2, tsFileContent2);

  const file1 = new FileHandler(tsFilePath);

  it('content', () => {
    assert.equal(file1.content, tsFileContent);
  });

  it('getImportees', () => {
    return file1.getImportees([]).then((value) => {
      assert.isArray(value);
      assert.instanceOf(value[0], FileHandler);
      assert.equal(value[0].content, tsFileContent2);
    });
  });
});
