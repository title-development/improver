import {Injectable} from "@angular/core";
import {Validator, AbstractControl} from "@angular/forms";

@Injectable()
export class SelectValidator implements Validator {

  options: {
    required?: boolean;
    minModelSize?: number;
  } = {};

  validate(c: AbstractControl) {
    if (!this.options) return null;

    const errors: any = {};
    if (this.options.required && (!c.value || (c.value instanceof Array) && c.value.length === 0))
      errors.required = true;
    if (this.options.minModelSize && (!c.value || (c.value instanceof Array) && c.value.length < this.options.minModelSize))
      errors.minModelSize = true;

    return Object.keys(errors).length > 0 ? errors : null;
  }

}
