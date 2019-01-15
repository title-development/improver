import {
  AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  ContentChildren, EventEmitter,
  forwardRef,
  Input, isDevMode, OnInit, Output,
  Provider,
  QueryList,
  TemplateRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CvTemplate } from '../../common/cv-template.directive';
import { CvSelection } from '../../util/CvSelection';
import { CvRadioButton } from '../../radio/cv-radio/cv-radio.button';
import { CvCheckbox } from '../cv-checkbox/cv-checkbox';

export const CHECKBOX_GROUP_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CvCheckboxGroup),
  multi: true
};

let uniqueId = 0;

@Component({
  selector: 'cv-checkbox-group',
  templateUrl: './cv-checkbox.group.html',
  styleUrls: ['./cv-checkbox.group.scss'],
  host: {
    'class': 'cv-checkbox-group',
    '[class.-disabled]': 'disabled',
    '[class.-readonly]': 'readonly'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    CHECKBOX_GROUP_VALUE_ACCESSOR
  ]
})
export class CvCheckboxGroup extends CvSelection implements ControlValueAccessor, AfterContentInit {

  @Input()
  set disabled(value) {
    this._disabled = value;
    if (this.checkboxes) {
      this.checkboxes.forEach(checkbox => checkbox.disabled = value);
    }
  }

  get disabled() {
    return this._disabled;
  }

  private _disabled: boolean = false;

  @Input()
  set readonly(value) {
    this._readonly = value;
    if (this.checkboxes) {
      this.checkboxes.forEach(checkbox => checkbox.readonly = value);
    }
  }

  get readonly() {
    return this._readonly;
  }

  private _readonly: boolean = false;
  @Input() required: boolean = false;
  @Input() labelKey: string;
  @Input() valueKey: string;
  @Input() items: Array<any>;

  @ContentChildren(CvTemplate) templates: QueryList<any>;
  @ContentChildren(forwardRef(() => CvCheckbox), {descendants: true}) checkboxes: QueryList<CvCheckbox>;

  @Output() check: EventEmitter<any> = new EventEmitter<any>();

  itemTemplate: TemplateRef<any>;
  id = uniqueId++;

  constructor(private changeDetectorRef: ChangeDetectorRef) {
    super();
  }

  writeValue(model: any): void {
    if (model instanceof Array) {
      this.clearSelection();
      model.forEach(item => {
        if (item) {
          this.addSelection(item, this.valueKey);
        }
      });
    }
    this.changeDetectorRef.markForCheck();
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

  addOrRemoveSelection(model: any): void {
    if (this.disabled || this.readonly) {
      return;
    }
    this.check.emit(model);
    if (this.existsSelection(model, this.valueKey)) {
      this.removeSelection(model, this.valueKey);
    } else {
      if (model) {
        this.addSelection(model, this.valueKey);
      }
    }
    this.onChange(this.getSelectionRemapedItems(this.valueKey));
    this.changeDetectorRef.markForCheck();
    if (this.checkboxes) {
      this.checkboxes.forEach(checkbox => checkbox.checked = this.existsSelection(checkbox.value, this.valueKey));
    }
  }

  isSelected(value: any): boolean {
    return this.existsSelection(value, this.valueKey);
  }

  ngAfterContentInit(): void {
    this.templates.forEach((item) => {
      this.itemTemplate = item.template;
    });
    this.checkboxes.forEach(checkbox => {
      checkbox.onSelect.subscribe(item => this.addOrRemoveSelection(item));
    });
  }

  private onTouched = () => {
  };
  private onChange = (_: any) => {
  };
}
