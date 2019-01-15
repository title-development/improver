import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CvDateRangePickerComponent } from './cv-date-range-picker/cv-date-range-picker.component';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [CvDateRangePickerComponent],
  exports: [CvDateRangePickerComponent]
})
export class CvDateRangePickerModule {

}
