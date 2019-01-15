import { Directive } from "@angular/core";
import { NgControl } from "@angular/forms";

@Directive({
  selector: '[creditCardNumberMask]',
  host: {
    '(ngModelChange)': 'onInputChange($event)',
    '(keydown.backspace)': 'onInputChange($event.target.value, true)'
  }
})

export class CreditCardNumberMask {
  constructor(public model: NgControl) {}

  onInputChange(event, backspace) {
    let newVal = event.replace(/\D/g, '');

    if (newVal.length == 0) {
      newVal = '';
    } else if (newVal.length <= 4) {
      newVal = newVal.replace(/^(\d{0,4})/, '$1');
    } else if (newVal.length <= 8) {
      newVal = newVal.replace(/^(\d{0,4})(\d{0,4})/, '$1 $2');
    } else if (newVal.length <= 12) {
      newVal = newVal.replace(/^(\d{0,4})(\d{0,4})(\d{0,4})/, '$1 $2 $3');
    } else  {
      newVal = newVal.replace(/^(\d{0,4})(\d{0,4})(\d{0,4})(\d{0,4})/, '$1 $2 $3 $4');
    }

    this.model.valueAccessor.writeValue(newVal);
  }
}
