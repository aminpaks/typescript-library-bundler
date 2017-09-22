import { Component, OnInit } from '@angular/core';
import { isEmpty, merge as lodashMerge } from 'lodash';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

@Component({
  selector: 'selector',
  templateUrl: './component.html',
  styleUrls: ['./component.css', './component-second.less',
              './component-third.scss'],
})
export class AwesomeComponent implements OnInit {
  constructor() { }

  public obx: Observable<number>;

  ngOnInit() {

    this.obx = Observable.of(10);

    if (isEmpty([])) {
      const originObj = { check: false };
      console.log('It is empty!', lodashMerge(originObj, { check: true, newKey: 'yes!' }));
    }
  }
}
