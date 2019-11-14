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

  private previousValue;
  private spacesRegExp = new RegExp('(?:(?![\\n\\r])\\s){2,}', 'g');
  private newLinesRegExp = new RegExp('[\n\r]{3,}', 'g');

  constructor(private renderer: Renderer2, private elementRef: ElementRef) {

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
    if (value) {
      this.renderer.setProperty(
        this.elementRef.nativeElement,
        'value',
        value
      );

      this.onTouched();
      this.onChange(value);
      this.previousValue = value;
    }
  }

  @HostListener('focus', ['$event.target', '$event.target.value'])
  @HostListener('keyup', ['$event.target', '$event.target.value'])
  onKeyUp(element: HTMLInputElement, string: string) {
    if (string == this.previousValue) return;
    let cursorPosition: number = element.selectionStart;
    let formattedString = string;
    if (this.spacesRegExp.test(string) || this.newLinesRegExp.test(string)) {
      formattedString = this.formatString(formattedString);
      this.writeValue(formattedString);
      element.focus();
      //setCursor position after formatting
      element.setSelectionRange(cursorPosition - 1, cursorPosition - 1);
    } else {
      this.writeValue(formattedString);
    }
  }

  @HostListener('blur', ['$event', '$event.target.value'])
  onBlur(event: string, string: string): void {
    if (string == this.previousValue) return;
    let formattedString = this.formatString(string.trim());
    this.writeValue(formattedString);
  }

  formatString(value: string) {
    return value.trimLeft()
      .replace(this.spacesRegExp, ' ')
      .replace(this.newLinesRegExp, '\n\r');
  }

}
