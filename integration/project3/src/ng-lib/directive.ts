import { Directive } from '@angular/core';
import { merge } from 'lodash';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

@Directive({
  selector: '[ng-lib]',
})
export class NGLibDirective {

  constructor () {
    const value = merge({ test: 'value' }, { test: ['array'] });
    const obx = Observable.of([1, 2, 3]);
  }
}
