import { Directive, forwardRef, Input } from '@angular/core';
import { NG_ASYNC_VALIDATORS, Validator, AbstractControl } from '@angular/forms';
import { SecurityService } from '../auth/security.service';
import { RegistrationService } from '../api/services/registration.service';
import { ErrorHandler } from '../util/error-handler';
import { CompanyService } from "../api/services/company.service";

@Directive({
  selector: '[companyEmailUniqueValidator][formControlName], [companyEmailUniqueValidator][ngModel]',
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => CompanyEmailUniqueValidator), multi: true
    }
  ]
})

export class CompanyEmailUniqueValidator implements Validator {
  private timeoutDelay: number = 500;
  private timeout: any;

  @Input() previousEmail;
  @Input('companyEmailUniqueValidator') option: any;
  @Input('companyEmailUniqueReverse') reverse: boolean;
  @Input('companyEmailUniqueCatchError') catchError: boolean = false;

  constructor(private companyService: CompanyService, private errorHandler: ErrorHandler) {
  }

  validate(control: AbstractControl): Promise<{ [key: string]: any }> {
    if (this.option != control.value) {
      if(this.previousEmail && control.value) {
        if((control.value as String).toLowerCase().trim() === this.previousEmail.toLowerCase().trim()) {
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
          .isEmailFree(value)
          .subscribe(
            data => {
              //response code 200 means that value is unique
              this.reverse ? resolve({emailUnique: true}) : resolve(null);
            },
            err => {
              //in any other cases - value is not unique
              !this.reverse ? resolve({emailUnique: true}) : resolve(null);
            });
      }, this.timeoutDelay);
    });
  }


}
