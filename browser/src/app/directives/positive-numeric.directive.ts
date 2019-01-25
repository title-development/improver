import { Directive, ElementRef, forwardRef, Inject, Provider, Renderer2 } from '@angular/core';
import { MaskDirective } from './MaskDirective';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

export const MASK_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => PositiveNumericDirective),
  multi: true
};

@Directive({
    selector: '[positiveNumeric]',
  host: {
    '(input)': 'onInput($event, $event.target.value)'
  },
  providers: [MASK_VALUE_ACCESSOR]
})
export class PositiveNumericDirective extends MaskDirective {

  applyMask(value: any): any {
    value = value.toString().replace(/\D/g, '');
    if (value.length == 0 || value[0] == 0) {
      return '';
    } else {
      return value;
    }
  }

  constructor(@Inject(Renderer2) public renderer: Renderer2, @Inject(ElementRef) public element: ElementRef) {
    super(renderer, element);
  }
}
