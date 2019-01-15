import { DOCUMENT } from "@angular/common";
import {
  Component, ComponentRef, ElementRef, forwardRef, Inject, Input, OnInit, Optional, Provider,
  Renderer2, Self, SkipSelf, ViewChild
} from '@angular/core';
import { ControlValueAccessor, DefaultValueAccessor, NG_VALUE_ACCESSOR, NgControl, NgForm } from '@angular/forms';
import { Subscription } from "rxjs";
import { BackdropType, OverlayRef } from "../../util/overlayRef";
import { CvDatePickerDropdownComponent } from "../cv-date-picker-dropdown/cv-date-picker-dropdown";

export const DATE_PICKER_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CvDatePickerComponent),
  multi: true
};

@Component({
  selector: 'cv-date-picker',
  templateUrl: './cv-date-picker.html',
  styleUrls: [ './cv-date-picker.scss' ],
  host: {
    'class': 'cv-date-picker',
    '[class.-disabled]': 'disabled',
    '[class.-submitted]': 'isSubmitted()'
  },
  providers: [
    DATE_PICKER_VALUE_ACCESSOR
  ]
})
export class CvDatePickerComponent implements ControlValueAccessor, OnInit {
  @ViewChild(DefaultValueAccessor) private valueAccessor: DefaultValueAccessor;
  @Input() required;
  @Input() label: string = 'Choose a date';
  @Input() maxDate: string;
  @Input() minDate: string;
  @Input() weekStart: string | 'monday' | 'sunday' = 'sunday';
  @Input() format: string = 'YYYY MMMM DD';

  disabled: boolean = false;
  value: string;
  opened: boolean;

  private onOverlayClick: (event: Event) => void;
  private dropDownRef: ComponentRef<CvDatePickerDropdownComponent>;
  private $format: Subscription;

  constructor(@Inject(DOCUMENT) private document: any,
              private renderer: Renderer2,
              private overlayRef: OverlayRef,
              @Optional() @SkipSelf() private form:NgForm) {
    const self = this;
    this.onOverlayClick = function onOverlayClick(event: MouseEvent): void {
      self.closeByOverlay(event);
    };
  }

  writeValue(value: any): void {
    if(!this.opened && value) {
      this.onChange(value);
    }
    if(value) {
      this.label = value;
      this.value = value;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  closeByOverlay(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.cv-holder')) {
      this.opened = false;
      this.$format.unsubscribe();
      this.overlayRef.removeBackdrop();
      this.document.removeEventListener('click', this.onOverlayClick, true);
    }
  }

  openDatePicker(htmlElement: HTMLElement): void {
    const holder: HTMLElement = this.overlayRef.createBackdrop(BackdropType.popup, htmlElement);
    this.dropDownRef = this.overlayRef.appendComponentToElement<CvDatePickerDropdownComponent>(CvDatePickerDropdownComponent, holder);
    this.dropDownRef.instance.format = this.format;
    this.dropDownRef.instance.maxDate = this.maxDate;
    this.dropDownRef.instance.minDate = this.minDate;
    this.dropDownRef.instance.date = this.value ? this.value : '';
    this.dropDownRef.instance.weekStart = this.weekStart;
    this.dropDownRef.instance.init();
    this.$format = this.dropDownRef.instance.$select.subscribe(value => {
      if (value) {
        this.label = value;
        this.value = value;
        this.onChange(value);
      }
      this.overlayRef.removeBackdrop();
    });
    this.document.addEventListener('click', this.onOverlayClick, true);
  }

  ngOnInit(): void {

  }

  isRequired(): boolean {
    return this.required != undefined;
  }

  isSubmitted(): boolean {
    return this.form && this.form.submitted;
  }

  private onTouched = () => {
  };
  private onChange = (_: any) => {
  };
}
