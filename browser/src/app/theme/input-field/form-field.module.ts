import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvInputFieldComponent } from './cv-input-field/cv-input-field.component';
import { CvIconModule } from '../icon/cv-icon-module';
import { CvFieldsModule } from '../fields/cv-fields.module';

@NgModule({
  imports: [
    CommonModule,
    CvIconModule,
    CvFieldsModule
  ],
  declarations: [ CvInputFieldComponent ],
  exports: [ CvInputFieldComponent ]
})
export class CvInputFieldModule {
}
