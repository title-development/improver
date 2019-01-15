import { Directive, ElementRef, forwardRef, Inject, Provider, Renderer2 } from "@angular/core";
import { NG_VALUE_ACCESSOR, } from "@angular/forms";
import { MaskDirective } from "./MaskDirective";

export const MASK_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DateMask),
  multi: true
};

@Directive({
  selector: 'dateMask, [dateMask]',
  host: {
    '(input)': 'onInput($event.target.value)',
  },
  providers: [MASK_VALUE_ACCESSOR]
})

export class DateMask extends MaskDirective {

  applyMask(value: any): any {
    value = value.toString().replace(/\D/g, '');
    if (value.length == 0) {
      return '';
    } else if (value.length <= 4) {
      return value.replace(/^(\d{0,4})/, '$1');
    } else if (value.length <= 6) {
      return value.replace(/^(\d{0,4})(\d{0,2})/, '$1-$2');
    } else if (value.length <= 8) {
      return value.replace(/^(\d{0,4})(\d{0,2})(.*)/, '$1-$2-$3');
    } else {
      return this.lastValue;
    }
  }

  constructor(@Inject(Renderer2) public renderer: Renderer2, @Inject(ElementRef) public element: ElementRef) {
    super(renderer, element);
  }
}
