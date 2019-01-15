import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OverlayRef } from '../util/overlayRef';
import { CvDatePickerDropdownComponent } from './cv-date-picker-dropdown/cv-date-picker-dropdown';
import { CvDatePickerComponent } from './cv-date-picker/cv-date-picker';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [CvDatePickerDropdownComponent, CvDatePickerComponent],
  exports: [CvDatePickerComponent],
  entryComponents: [CvDatePickerDropdownComponent],
  providers: [OverlayRef]
})
export class CvDatePickerModule {

}
