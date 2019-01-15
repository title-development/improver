import { Directive, forwardRef, Input } from '@angular/core';
import { NG_ASYNC_VALIDATORS, Validator, AbstractControl } from '@angular/forms';
import { ErrorHandler } from '../util/error-handler';
import { UserService } from "../api/services/user.service";

@Directive({
  selector: '[emailUniqueValidator][formControlName], [emailUniqueValidator][ngModel]',
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => EmailUniqueValidator), multi: true
    }
  ]
})

export class EmailUniqueValidator implements Validator {
  private timeoutDelay: number = 500;
  private timeout: any;

  @Input() previousEmail;
  @Input('emailUniqueValidator') option: any;
  @Input('emailUniqueReverse') reverse: boolean;
  @Input('emailUniqueCatchError') catchError: boolean = false;


  constructor(private userService: UserService, private errorHandler: ErrorHandler) {
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
        this.userService
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
