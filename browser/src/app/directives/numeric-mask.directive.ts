import { Directive, ElementRef, forwardRef, Inject, Provider, Renderer2 } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { MaskDirective } from "./MaskDirective";

export const MASK_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => NumericMask),
  multi: true
};

@Directive({
  selector: 'numericMask, [numericMask]',
  host: {
    '(input)': 'onInput($event.target.value)',
  },
  providers: [MASK_VALUE_ACCESSOR]
})
export class NumericMask extends MaskDirective {

  applyMask(value: any): string {
    return value.toString().replace(/\D/g, '');
  }

  constructor(@Inject(Renderer2) public renderer: Renderer2, @Inject(ElementRef) public element: ElementRef) {
    super(renderer, element);
  }
}
