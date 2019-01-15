import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvCollapseComponent } from './cv-collapse/cv-collapse.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [CvCollapseComponent],
  exports: [CvCollapseComponent]
})
export class CvCollapseModule {}
