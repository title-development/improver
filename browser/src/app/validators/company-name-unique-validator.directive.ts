import { Directive, forwardRef, Input } from '@angular/core';
import { NG_ASYNC_VALIDATORS, Validator, AbstractControl } from '@angular/forms';
import { SecurityService } from '../auth/security.service';
import { RegistrationService } from '../api/services/registration.service';
import { ErrorHandler } from '../util/error-handler';
import { CompanyService } from "../api/services/company.service";

@Directive({
  selector: '[companyNameUniqueValidator][formControlName], [companyNameUniqueValidator][ngModel]',
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => CompanyNameUniqueValidator), multi: true
    }
  ]
})

export class CompanyNameUniqueValidator implements Validator {
  private timeoutDelay: number = 500;
  private timeout: any;

  @Input() previousName;
  @Input('companyNameUniqueValidator') option: any;
  @Input('companyNameUniqueReverse') reverse: boolean;
  @Input('companyNameUniqueCatchError') catchError: boolean = false;

  constructor(private companyService: CompanyService, private errorHandler: ErrorHandler) {
  }

  validate(control: AbstractControl): Promise<{ [key: string]: any }> {
    if (this.option != control.value) {
      if(this.previousName && control.value) {
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
        this.companyService
          .isNameFree(value)
          .subscribe(
            data => {
              //response code 200 means that value is unique
              this.reverse ? resolve({nameUnique: true}) : resolve(null);
            },
            err => {
              //in any other cases - value is not unique
              !this.reverse ? resolve({nameUnique: true}) : resolve(null);
            });
      }, this.timeoutDelay);
    });
  }


}
