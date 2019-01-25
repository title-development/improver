import {
  Directive, ElementRef, forwardRef, Inject, Provider, Renderer2
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { MaskDirective } from "./MaskDirective";

export const MASK_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => PhoneMask),
  multi: true
};

@Directive({
  selector: '[phoneMask]',
  host: {
    '(input)': 'onInput($event, $event.target.value)'
  },
  providers: [MASK_VALUE_ACCESSOR]
})
export class PhoneMask extends MaskDirective {

  applyMask(value): any {
    value = value.toString().replace(/\D/g, '');
    if (value.length == 0) {
      return '';
    } else if (value.length <= 3) {
      return value.replace(/^(\d{0,3})/, '$1');
    } else if (value.length <= 6) {
      return value.replace(/^(\d{0,3})(\d{0,3})/, '$1-$2');
    } else if (value.length <= 10) {
      return value.replace(/^(\d{0,3})(\d{0,3})(.*)/, '$1-$2-$3');
    } else {
      return this.lastValue;
    }
  }

  constructor(@Inject(Renderer2) public renderer: Renderer2, @Inject(ElementRef) public element: ElementRef) {
    super(renderer, element);
  }
}
