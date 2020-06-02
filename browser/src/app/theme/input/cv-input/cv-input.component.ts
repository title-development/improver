import {
	Component,
	ElementRef,
	EventEmitter,
	HostBinding,
	Input, OnChanges,
	Optional,
	Output,
	Self, SimpleChanges,
	ViewEncapsulation
} from '@angular/core';
import { FormControl, NgControl } from '@angular/forms';
import { coerceBooleanProperty } from '../../util/util';

@Component({
  selector: 'input[cv-input], textarea[cv-input]',
  template: '',
  styleUrls: ['./cv-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'cv-input',
    '[disabled]': 'disabled',
    '[readonly]': 'readonly',
		'(blur)': 'onBlur()',
    '[class.-disabled]': 'disabled',
    '[class.-readonly]': 'readonly',
    '[class.-submitted]': 'isSubmitted()'
  }
})
export class CvInputComponent {
  @Input() required;
  private _disabled: boolean = false;
  private _readonly: boolean;

  @HostBinding('class.-icon') private _icon: boolean;
  @HostBinding('class.-hint') private _hint: boolean;

  @Input() cv_trim: string;
  @Output() cv_trimChange: EventEmitter<string> = new EventEmitter<string>();

  @Input()
  set disabled(value: any) {
    this._disabled = coerceBooleanProperty(value);
  }

  get disabled() {
    return this.ngControl ? this.ngControl.disabled : this._disabled;
  }

  @Input()
  get readonly() {
    return this._readonly;
  }

  set readonly(value: any) {
    this._readonly = coerceBooleanProperty(value);
  }

  set icon(value: boolean) {
    this._icon = value;
  }

  get icon(): boolean {
    return this._icon;
  }

  set hint(value: boolean) {
    this._hint = value;
  }

  get hint(): boolean {
    return this._hint;
  }

  @Input() type: string;
  @Input() maxlength: string;

  constructor(@Optional() @Self() public ngControl: NgControl,
              public elementRef: ElementRef
  ) {

  }

	onBlur() {
		if (this.cv_trim){
			// Trim text and replace all multiple spaces and multiple empty lines to single space and single empty line
			this.cv_trimChange.emit(this.cv_trim.replace(/\s {2,}/g, ' ')
																					.replace(/^\s*[\r\n]{2,}/gm, '\n')
																					.trim());
		}
	}

  isRequired(): boolean {
    return this.required != undefined;
  }

  isSubmitted(): boolean {
    return this.ngControl && (this.ngControl as any)._parent && (this.ngControl as any)._parent.submitted;
  }

}
