import * as _ from 'lodash';

export function loadBase(): void {
  // mixing some lodash operators
  const result = _.chain([1, 2, 3, 4, 5])
    .map(element => element + 1)
    .value();

  console.log(result);
}
