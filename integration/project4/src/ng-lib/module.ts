import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NGLibDirective } from './directive';

@NgModule({
  declarations: [NGLibDirective],
  imports: [ CommonModule ],
  exports: [NGLibDirective],
  providers: [],
})
export class NGLibModule {}
