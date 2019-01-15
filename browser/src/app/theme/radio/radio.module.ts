import { NgModule } from '@angular/core';
import { CvRadioGroup } from './cv-radio-group/cv-radio.group';
import { CvRadioButton } from './cv-radio/cv-radio.button';
import { CommonModule } from '@angular/common';
import { CvThemeCoreModule } from '../cv-theme-core';
import { CvTemplate } from '../common/cv-template.directive';


@NgModule({
  imports: [CommonModule],
  declarations: [ CvRadioButton, CvRadioGroup],
  exports: [ CvRadioButton, CvRadioGroup]
})
export class CvRadioModule {

}
