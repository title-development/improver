import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvFieldHintComponent } from './cv-field-hint/cv-field-hint.component';
import { CvFieldErrorComponent } from './cv-field-error/cv-field-error.component';
import { CvFieldLabelComponent } from './cv-field-label/cv-field-label.component';
import { CvIconModule } from '../icon/cv-icon-module';

@NgModule({
  imports: [ CommonModule, CvIconModule ],
  declarations: [ CvFieldErrorComponent, CvFieldHintComponent, CvFieldLabelComponent ],
  exports: [ CvFieldErrorComponent, CvFieldHintComponent, CvFieldLabelComponent ]
})
export class CvFieldsModule {
}
