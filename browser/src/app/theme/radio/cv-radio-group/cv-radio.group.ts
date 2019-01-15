import {
  AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  ContentChildren,
  forwardRef,
  Input,
  Provider,
  QueryList,
  TemplateRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CvTemplate } from '../../common/cv-template.directive';
import { CvSelection } from '../../util/CvSelection';
import { CvRadioButton } from '../cv-radio/cv-radio.button';
import { first } from 'rxjs/operators';

export const RADIO_GROUP_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CvRadioGroup),
  multi: true
};

@Component({
  selector: 'cv-radio-group',
  templateUrl: './cv-radio.group.html',
  styleUrls: ['./cv-radio.group.scss'],
  host: {
    'class': 'cv-radio-group',
    '[class.-disabled]': 'disabled',
    '[class.-readonly]': 'readonly'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    RADIO_GROUP_VALUE_ACCESSOR
  ]
})
export class CvRadioGroup extends CvSelection implements AfterContentInit, ControlValueAccessor {

  @Input()
  set disabled(value) {
    this._disabled = value;
    if (this.radios) {
      this.radios.forEach(radio => radio.disabled = value);
    }
  }

  get disabled() {
    return this._disabled;
  }

  private _disabled: boolean = false;

  @Input()
  set readonly(value) {
    this._readonly = value;
    if (this.radios) {
      this.radios.forEach(radio => radio.readonly = value);
    }
  }

  get readonly() {
    return this._readonly;
  }

  private _readonly: boolean = false;
  @Input() labelKey: string;
  @Input() valueKey: string;
  @Input() items: Array<any>;
  @Input() trackBy: string | ((item: any) => string);

  @ContentChildren(CvTemplate) templates: QueryList<any>;
  @ContentChildren(forwardRef(() => CvRadioButton), {descendants: true}) radios: QueryList<CvRadioButton>;

  itemTemplate: TemplateRef<any>;

  constructor(private changeDetectorRef: ChangeDetectorRef) {
    super();
  }

  writeValue(model: any): void {
    if (model) {
      this.clearSelection();
      this.addSelection(model, this.valueKey);
    }
    this.changeDetectorRef.markForCheck();
  }

  isSelected(model: any): boolean {
    return this.existsSelection(model, this.valueKey);
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

  select(model: any): void {
    this.clearSelection();
    this.addSelection(model, this.valueKey);
    this.onChange(this.getValueKey(model, this.valueKey));
    this.changeDetectorRef.markForCheck();
    if (this.radios) {
      this.radios.forEach(radio => radio.checked = this.existsSelection(radio.value, this.valueKey));
    }
  }

  ngAfterContentInit() {
    this.templates.forEach((item) => {
      this.itemTemplate = item.template;
    });
    if (this.radios) {
      this.radios.forEach(radio => {
        radio.onSelect.subscribe(item => {
          this.select(item);
        });
      });
    }
    this.radios.changes.pipe(first()).subscribe(() => {
      if (this.radios) {
        this.radios.forEach(radio => {
          if (radio.onSelect.observers.length == 0) {
            radio.onSelect.subscribe(item => {
              this.select(item);
            });
          }
        });
      }
    });
  }

  private onTouched = () => {
  };
  private onChange = (_: any) => {
  };
}
