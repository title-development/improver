import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvInputComponent } from './cv-input/cv-input.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [CvInputComponent],
  exports: [CvInputComponent]
})
export class CvInputModule {}
