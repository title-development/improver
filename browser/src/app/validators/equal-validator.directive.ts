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

  constructor(@Attribute('validateEqual') public validateEqual: string,
              @Attribute('validationEqualReverse') public validationEqualReverse: string) {
  }

  private get isReverse() {
    if (!this.validationEqualReverse) return false;

    return this.validationEqualReverse === 'true';
  }

  validate(control: AbstractControl): { [key: string]: any } {
    // self value
    if (!control) {
      return null;
    }
    let selfValue = control.value;

    // control value
    let compareControl = control.root.get(this.validateEqual);
    if (!compareControl) {
      return null;
    }

    // value not equal
    if (compareControl && selfValue !== compareControl.value && !this.isReverse) {
      return {
        validateEqual: true
      };
    }

    // value equal and reverse
    if (compareControl && selfValue === compareControl.value && this.isReverse) {
      if (compareControl.errors && compareControl.errors['validateEqual']) {
        delete compareControl.errors['validateEqual'];
        if (!Object.keys(compareControl.errors).length) compareControl.setErrors(null);
      }
    }

    // value not equal and reverse
    if (compareControl && selfValue !== compareControl.value && this.isReverse) {
      compareControl.setErrors({'validateEqual': true});
    }

    return null;
  }
}
