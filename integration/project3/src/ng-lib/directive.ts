import { Directive } from '@angular/core';
import { merge } from 'lodash';

@Directive({
  selector: '[ng-lib]',
})
export class NGLibDirective {

  constructor () {
    const value = merge({ test: 'value' }, { test: ['array'] });
  }
}
