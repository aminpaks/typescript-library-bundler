import { Directive } from '@angular/core';
import { isArray } from 'lodash';

@Directive({
  selector: '[ng-lib]',
})
export class NGLibDirective {
  constructor() {
    if (isArray([]) && !isArray({})) {
      console.log('Lodash isArray is working.');
    }
  }
}
