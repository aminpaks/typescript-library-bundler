import { assert } from 'chai';
import { parseArguments } from '../src/cli';

describe('CLI', () => {

  it('parseArguments Full', () => {

    const fullArguments: string[] = [
      '--project',
      './source/project1',
      '--noClean',
    ];

    const args = parseArguments(fullArguments);

    assert.equal(args.project, './source/project1');
    assert.isUndefined(args.outDir);
    assert.isTrue(args.noClean);
    assert.isFalse(args.noPkgValidation);
    assert.isFalse(args.noDepsValidation);

  });

  it('parseArguments Alias', () => {

    const aliasArguments: string[] = [
      '-g',
      '-d',
      '-o',
      '../output',
      '-p',
      './',
    ];

    const args = parseArguments(aliasArguments);

    assert.equal(args.project, './');
    assert.equal(args.outDir, '../output');
    assert.isFalse(args.noClean);
    assert.isTrue(args.noPkgValidation);
    assert.isTrue(args.noDepsValidation);

  });

});
