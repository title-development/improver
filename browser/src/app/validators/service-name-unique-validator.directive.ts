import { Directive, forwardRef, Input, OnInit } from '@angular/core';
import { AbstractControl, NG_ASYNC_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { ServiceTypeService } from '../api/services/service-type.service';

@Directive({
  selector: '[serviceNameUniqueValidator][formControlName], [serviceNameUniqueValidator][ngModel]',
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => ServiceNameUniqueValidatorDirective), multi: true
    }
  ]
})
export class ServiceNameUniqueValidatorDirective implements Validator {

  @Input() previousName;

  private timeoutDelay: number = 500;
  private timeout: any;
  constructor(private serviceType: ServiceTypeService){}

  validate(control: AbstractControl): ValidationErrors | null {
    if(control.value) {
      if(this.previousName) {
        if((control.value as String).toLowerCase().trim() === this.previousName.toLowerCase().trim()) {
          return new Promise((resolve) => resolve(null));
        } else {
          return this.validateUnique(control.value);
        }
      } else {
        return this.validateUnique(control.value);
      }
    } else {
      return new Promise((resolve) => resolve(null));
    }
  }

  private validateUnique(value: string) {
    clearTimeout(this.timeout);
    return new Promise((resolve) => {
      this.timeout = setTimeout(() => {
        this.serviceType
          .isNameFree(value)
          .subscribe(
            data => {
              resolve(null);
            },
            err => {
              resolve({unique: true});
            });
      }, this.timeoutDelay);
    });
  }

}
