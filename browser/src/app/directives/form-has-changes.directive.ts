import { Directive, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';

@Directive({
  selector: '[formHasChanges]',
  exportAs: 'formHasChanges',
})
  export class FormHasChangesDirective implements OnInit {
  @Input('formHasChanges') form: NgForm;

  @Input() set formHasChangesAsyncData(val) {
    if (val) {
      setTimeout(() => {
        this.originalState = this.form.value;
        this.compare();
      }, 0);
    }
  }

  @Output() onFormHasChanges: EventEmitter<boolean> = new EventEmitter();

  private set originalState(value) {
    this._originalState = JSON.stringify(value)
  };
  private get originalState(): string {
    return this._originalState;
  }
  private _originalState: string;

  constructor(private el: ElementRef) {

  }

  ngOnInit(): void {
    if (!this.form) {
      console.warn('Could not find a valid NgForm');
    } else {
      this.form.statusChanges.subscribe(res => {
        if (!this.form.dirty) {
          this.originalState = this.form.value;
        }
      });
      this.form.valueChanges.subscribe(() => {
        if (this.form.dirty) {
          this.compare();
        }
      });
    }
  }

  markAsNotChanged(): void {
    this.originalState = this.form.value;
    this.onFormHasChanges.emit(false);
  }

  private compare():void {
    let changedValue = JSON.stringify(this.form.value);
    if (changedValue != this.originalState) {
      this.onFormHasChanges.emit(true);
    } else {
      this.onFormHasChanges.emit(false);
    }
  }
}
