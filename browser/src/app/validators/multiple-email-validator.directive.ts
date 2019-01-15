import { Directive, forwardRef } from '@angular/core';
import { AbstractControl, NG_ASYNC_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[multipleEmailsValidator][formControlName], [multipleEmailsValidator][ngModel]',
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => MultipleEmailValidatorDirective), multi: true
    }
  ]
})
export class MultipleEmailValidatorDirective implements Validator {
  validate(control: AbstractControl): Promise<{ [key: string]: any }> {
    return new Promise((resolve) => {
      if (control.value.split(',').every(email => (/^[\w.+-]+@[\w.+-]+\.[a-zA-Z0-9]{2,}$/ig.test(email.trim())))) {
        resolve(null);
      } else {
        resolve({multipleEmails: true});
      }
    });
  }
}
