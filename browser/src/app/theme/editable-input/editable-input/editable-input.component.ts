import {
  Component,
  ContentChild,
  EventEmitter,
  forwardRef,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Provider
} from '@angular/core';
import { CvInputComponent } from '../../input/cv-input/cv-input.component';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  NgControl,
  ValidationErrors,
  Validator
} from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { MediaQuery, MediaQueryService } from "../../../api/services/media-query.service";
import { takeUntil } from "rxjs/operators";

export const EDITABLE_INPUT_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => EditableInputComponent),
  multi: true
};

export const EDITABLE_INPUT_VALUE_VALIDATOR: Provider = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => EditableInputComponent),
  multi: true
};

@Component({
  selector: 'cv-editable-input',
  templateUrl: './editable-input.component.html',
  styleUrls: ['./editable-input.component.scss'],
  providers: [EDITABLE_INPUT_VALUE_ACCESSOR, EDITABLE_INPUT_VALUE_VALIDATOR]
})
export class EditableInputComponent implements ControlValueAccessor, Validator, OnInit, OnDestroy {
  @Input() buttonEditLabel: string = 'Change';
  @Input() buttonSaveLabel: string = 'Save';
  @ContentChild(CvInputComponent, {static: true}) input: CvInputComponent;
  @Output() onSave: EventEmitter<any> = new EventEmitter<any>();

  disabled: boolean = false;
  editMode: boolean = false;
  disableSaveButton: boolean = true;
  mediaQuery: MediaQuery;
  private savedValue: any;
  private value: any;
  private ngControl: NgControl;
  private validationStatusChanges$: Subscription;

  private readonly destroyed$ = new Subject<void>();

  constructor(private injector: Injector,
              private mediaQueryService: MediaQueryService) {
    this.subscribeForMediaQuery();
  }

  subscribeForMediaQuery(){
    this.mediaQueryService.screen
        .pipe(takeUntil(this.destroyed$))
        .subscribe((mediaQuery: MediaQuery) => {
          this.mediaQuery = mediaQuery;
        });
  }

  edit(event?): void {
    this.editMode = true;
    this.input.disabled = false;
    this.savedValue = this.value;
    this.disableSaveButton = true;
  }

  save(event?): void {
    const value = this.input.elementRef.nativeElement.value;
    this.value = value;
    this.onChange(value);
  }

  cancel(event?): void {
    this.editMode = false;
    this.input.elementRef.nativeElement.value = this.savedValue;
    this.input.disabled = true;
    this.onChange(this.savedValue);
  }

  ngOnInit(): void {
    this.ngControl = this.injector.get(NgControl);
    if (this.input) {
      this.input.disabled = !this.editMode;
    }
    this.input.elementRef.nativeElement.addEventListener('input', this.inputHandler);
  }

  ngOnDestroy(): void {
    this.input.elementRef.nativeElement.removeEventListener('input', this.inputHandler);
    this.validationStatusChanges$.unsubscribe();
    this.destroyed$.next();
    this.destroyed$.complete();
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

  writeValue(value: any): void {
    this.value = value;
    this.savedValue = value;
    if (this.input) {
      this.input.elementRef.nativeElement.value = value;
    }
  }

  private inputHandler = event => {
    this.disableSaveButton = this.savedValue == event.target.value;
  };

  registerOnValidatorChange(fn: () => void): void {
  }

  validate(control: AbstractControl): ValidationErrors | null {
    this.validationStatusChanges$ = control.statusChanges.subscribe(res => {
      if (res == 'VALID') {
        this.editMode = false;
        this.input.disabled = true;
        this.validationStatusChanges$.unsubscribe();
        setTimeout(() => {
          this.onSave.emit(this.value);
          this.savedValue = this.value;
        }, 0)
      } else if (res == 'INVALID') {
        this.validationStatusChanges$.unsubscribe();
      }
    });
    return null;
  }


  private onTouched = () => {
  };
  private onChange = (_: any) => {
  };

}
