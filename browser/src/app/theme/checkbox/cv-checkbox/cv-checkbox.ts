import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  Host,
  HostListener,
  Inject,
  Input,
  Optional,
  Output,
  Provider
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator
} from '@angular/forms';
import { CvCheckboxGroup } from '../cv-checkbox.group/cv-checkbox-group';

export const CHECKBOX_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CvCheckbox),
  multi: true
};

export const CHECKBOX_VALUE_VALIDATOR: Provider = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => CvCheckbox),
  multi: true
};

@Component({
  selector: 'cv-checkbox',
  templateUrl: './cv-checkbox.html',
  styleUrls: ['./cv-checkbox.scss'],
  host: {
    'class': 'cv-checkbox',
    '[class.-checked]': 'checked',
    '[class.-required]': 'isRequired()',
    '[class.-disabled]': 'disabled',
    '[class.-readonly]': 'readonly'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    CHECKBOX_VALUE_ACCESSOR,
    CHECKBOX_VALUE_VALIDATOR
  ]
})
export class CvCheckbox implements ControlValueAccessor, Validator {

  @Input() value: any;
  @Input() required;

  @Input()
  set disabled(value) {
    this._disabled = value;
    this.changeDetectorRef.markForCheck();
  }

  get disabled() {
    return this._disabled;
  }

  private _disabled: boolean = false;

  @Input()
  set readonly(value) {
    this._readonly = value;
    this.changeDetectorRef.markForCheck();
  }

  get readonly() {
    return this._readonly;
  }

  private _readonly: boolean = false;

  @Input()
  set checked(value: boolean) {
    this._checked = value;
    this.changeDetectorRef.markForCheck();
  }

  get checked(): boolean {
    return this._checked;
  }

  private _checked: boolean;

  @Output() onSelect = new EventEmitter<{ event: Event }>();

  constructor(private changeDetectorRef: ChangeDetectorRef) {
  }

  @HostListener('click', ['$event'])
  toggleCheck(event: MouseEvent) {
    if (this.readonly || this.disabled) return;
    this.checked = !this.checked;
    this.onChange(this.checked);
    this.onSelect.emit({event: event});
    this.changeDetectorRef.markForCheck();
  }

  writeValue(model: any): void {
    this.checked = !!model;
    this.changeDetectorRef.markForCheck();
  }

  isRequired(): boolean {
    return this.required != undefined;
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

  validate(control: AbstractControl): ValidationErrors | null {
    return !this.isRequired() || this.checked ? null : {
      required: true
    };
  }

  private onTouched = () => {
  };
  private onChange = (_: any) => {
  };
}
