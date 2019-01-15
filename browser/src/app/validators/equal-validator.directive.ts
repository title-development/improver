import { Directive, forwardRef, Attribute } from '@angular/core';
import { Validator, AbstractControl, NG_VALIDATORS } from '@angular/forms';

@Directive({
  selector: '[validateEqual][formControlName],[validateEqual][formControl],[validateEqual][ngModel]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => EqualValidator),
      multi: true
    }
  ]
})

export class EqualValidator implements Validator {

  constructor( @Attribute('validateEqual') public validateEqual: string,
               @Attribute('validationEqualReverse') public validationEqualReverse: string) {
  }

  private get isReverse() {
    if (!this.validationEqualReverse) return false;

    return this.validationEqualReverse === 'true';
  }

  validate(control: AbstractControl): { [key: string]: any } {
    // self value
    let selfValue = control.value;

    // control value
    let e = control.root.get(this.validateEqual);

    // value not equal
    if (e && selfValue !== e.value && !this.isReverse) {
      return {
        validateEqual: true
      };
    }

    // value equal and reverse
    if (e && selfValue === e.value && this.isReverse) {
      delete e.errors['validateEqual'];
      if (!Object.keys(e.errors).length) e.setErrors(null);
    }

    // value not equal and reverse
    if (e && selfValue !== e.value && this.isReverse) {
      e.setErrors({'validateEqual': true});
    }

    return null;
  }
}
