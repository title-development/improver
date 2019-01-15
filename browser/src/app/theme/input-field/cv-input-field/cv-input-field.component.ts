import {
  AfterContentChecked, AfterContentInit,
  AfterViewInit,
  Component, ContentChild, ElementRef, HostBinding, OnInit, Renderer2, ViewChild, ViewChildren,
  ViewEncapsulation
} from '@angular/core';
import { CvIconComponent } from '../../icon/cv-icon/cv-icon.component';
import { CvFieldHintComponent } from '../../fields/cv-field-hint/cv-field-hint.component';
import { CvInputComponent } from '../../input/cv-input/cv-input.component';
import { CvButtonComponent } from '../../button/cv-button/cv-button.component';
import { CvButtonEmptyComponent } from '../../button/cv-button-empty/cv-button-empty.component';
import { CvSelectComponent } from '../../select/cv-select/cv-select';
import { CvDatePickerComponent } from '../../date-picker/cv-date-picker/cv-date-picker';
import { CvDateRangePickerComponent } from '../../date-range-picker/cv-date-range-picker/cv-date-range-picker.component';

@Component({
  selector: 'cv-input-field',
  templateUrl: './cv-input-field.component.html',
  styleUrls: ['./cv-input-field.component.scss']
})
export class CvInputFieldComponent implements OnInit, AfterContentInit {

  @ContentChild(CvIconComponent) icon: CvIconComponent;
  @ContentChild(CvFieldHintComponent) hint: CvFieldHintComponent;
  @ContentChild(CvInputComponent) input: CvInputComponent;
  @ContentChild(CvDatePickerComponent) datePicker: CvDatePickerComponent;
  @ContentChild(CvDateRangePickerComponent) dateRangePicker: CvDateRangePickerComponent;
  @ContentChild(CvSelectComponent) select: CvSelectComponent;
  @ContentChild(CvButtonComponent) button: CvButtonComponent;
  @ContentChild(CvButtonEmptyComponent) buttonEmpty: CvButtonEmptyComponent;
  @HostBinding('class.-is-button') isButton: boolean = false;
  @HostBinding('class.required') isRequired: boolean = false;

  constructor() {
  }

  ngOnInit() {
    this.isButton = !!this.button || !!this.buttonEmpty;
    if (this.input) {
      this.input.icon = !!this.icon;
      this.input.hint = !!this.hint;
    }
  }

  ngAfterContentInit(): void {
    this.isRequired = this.input && this.input.isRequired()
      || this.select && this.select.isRequired()
      || this.datePicker && this.datePicker.isRequired()
      || this.dateRangePicker && this.dateRangePicker.isRequired();
  }
}
