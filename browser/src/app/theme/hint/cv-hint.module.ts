import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvHintComponent } from './cv-hint.component';
import { CvHintDirective } from './cv-hint.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [CvHintComponent, CvHintDirective],
  exports: [CvHintDirective],
  entryComponents: [CvHintComponent]
})
export class CvHintModule {

}
