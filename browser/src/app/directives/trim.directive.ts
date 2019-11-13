import { Directive, ElementRef, forwardRef, HostListener, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const TRIM_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => TrimDirective),
  multi: true
};

@Directive({
  selector: 'input[trim], textarea[trim]',
  providers: [TRIM_VALUE_ACCESSOR],

})
export class TrimDirective implements ControlValueAccessor {

  private spacesRegExp = new RegExp('(?:(?![\\n\\r])\\s){2,}', 'g');
  private newLinesRegExp = new RegExp('[\n\r]{3,}', 'g');

  constructor(private renderer: Renderer2,
              private elementRef: ElementRef) {
  }

  onTouched: () => void;
  onChange: (val: any) => void;

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
  }

  writeValue(value: any): void {
    if (value !== undefined && value !== null) {
      this.renderer.setProperty(
        this.elementRef.nativeElement,
        'value',
        value
      );
    }
  }

  @HostListener('focus', ['$event.target', '$event.target.value'])
  @HostListener('keyup', ['$event.target', '$event.target.value'])
  onKeyUp(element: HTMLInputElement, string: string) {
    let cursorPosition: number = element.selectionStart;
    let formattedString = string;
    if (this.spacesRegExp.test(string) || this.newLinesRegExp.test(string)) {
      formattedString = formattedString
        .replace(this.spacesRegExp, ' ')
        .replace(this.newLinesRegExp, '\n\r');
      this.writeValue(formattedString);
      this.onChange(formattedString);
      this.onTouched();
      element.focus();
      //setCursor position after formatting
      element.setSelectionRange(cursorPosition - 1, cursorPosition - 1);
    }
  }

  @HostListener('blur', ['$event.type', '$event.target.value'])
  onBlur(event: string, string: string): void {
    if (this.spacesRegExp.test(string) || this.newLinesRegExp.test(string)) {
      let formattedString = string.trim()
        .replace(this.newLinesRegExp, '\n\r')
        .replace(this.spacesRegExp, ' ');
      this.writeValue(formattedString);
      this.onChange(formattedString);
      this.onTouched();
    }
  }

}
