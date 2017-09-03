import { NgModule } from '@angular/core';
import { NGLibDirective } from './directive';

@NgModule({
  exports: [NGLibDirective],
  declarations: [NGLibDirective],
})
export class NGLibModule { }
