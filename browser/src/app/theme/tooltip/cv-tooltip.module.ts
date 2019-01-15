import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvTooltipDirective } from './cv-tooltip';

@NgModule({
  imports: [CommonModule],
  declarations: [CvTooltipDirective],
  exports: [CvTooltipDirective]
})
export class CvTooltipModule {}
