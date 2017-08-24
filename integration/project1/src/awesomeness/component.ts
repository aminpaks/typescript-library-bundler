import { Component, OnInit } from '@angular/core';
import { isEmpty } from 'lodash';

@Component({
  selector: 'selector',
  templateUrl: './component.html',
  styleUrls: ['./component.css', './component-second.less',
              './component-third.scss'],
})
export class AwesomeComponent implements OnInit {
  constructor() { }

  ngOnInit() {
    if (isEmpty([])) {
      console.log('It is empty!');
    }
  }
}
