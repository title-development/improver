import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvSpinnerDirective } from './cv-spinner';

@NgModule({
  imports: [CommonModule],
  declarations: [CvSpinnerDirective],
  exports: [CvSpinnerDirective]
})
export class CvSpinnerModule {

}
