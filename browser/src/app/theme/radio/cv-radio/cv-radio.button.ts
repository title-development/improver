import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output
} from '@angular/core';

@Component({
  selector: 'cv-radio',
  templateUrl: './cv-radio.button.html',
  styleUrls: ['./cv-radio.button.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'cv-radio',
    '[class.-checked]': 'selected',
    '[class.-disabled]': 'disabled',
    '[class.-readonly]': 'readonly',
  },
})
export class CvRadioButton {

  @Input() value: any;

  @Input()
  set disabled(value) {
    this._disabled = value;
    this.changeDetectorRef.markForCheck();
  }
  get disabled() {return this._disabled}
  private _disabled: boolean = false;

  @Input()
  set readonly(value) {
    this._readonly = value;
    this.changeDetectorRef.markForCheck();
  }
  get readonly() {return this._readonly}
  private _readonly: boolean = false;

  @Input()
  set selected(value: boolean) {
    this._selected = value;
    this.changeDetectorRef.markForCheck();
  }
  get selected(): boolean {return this._selected}
  private _selected: boolean = false;

  @Output() onSelect: EventEmitter<any>  = new EventEmitter();

  constructor(private changeDetectorRef: ChangeDetectorRef) {
  }

  @HostListener('click', ['$event'])
  check(event: MouseEvent) {
    if (this.readonly || this.disabled) return;
    this.onSelect.emit(this.value);
  }

}
