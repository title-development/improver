import { ElementRef, Inject, OnChanges, Renderer2, SimpleChanges } from "@angular/core";
import { ControlValueAccessor } from "@angular/forms";

export class MaskDirective implements ControlValueAccessor, OnChanges {

  public inputElement: HTMLInputElement;
  public lastValue: any;

  public onTouched = () => {
  };
  public onChange = (_: any) => {
  };

  writeValue(value: any): void {
    if (value) {
      this.onInput(value);
    } else {
      this.onInput('');
    }
  }

  registerOnChange(fn: (value: any) => any): void {
    this.onChange = fn
  }

  registerOnTouched(fn: () => any): void {
    this.onTouched = fn
  }

  setDisabledState(isDisabled: boolean): void {
    this.renderer.setProperty(this.element.nativeElement, 'disabled', isDisabled);
  }

  protected applyMask(value: any): any {
    return value;
  }

  /**
   * Delete character if not a number
   */
  protected deleteString(value) {
    if (isNaN(parseInt(value[value.length - 1]))) {
      return value.substring(0, value.length - 1);
    }
  }

  /**
   * Backspace keyboard event listener
   * @param (value) html input value
   */
  public onBackspacePressed(value) {
    this.setupMask();
    value = this.deleteString(value);
    if(value) {
      this.updateInput(value);
    }
  }

  /**
   * Input event listener
   * @param (value) html input value
   */
  onInput(value) {
    this.setupMask();
    value = this.applyMask(value);
    this.updateInput(value);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.setupMask();
    this.applyMask(this.inputElement.value);
  }

  /**
   * Write value to input element
   * @param value
   */
  protected updateInput(value: any) {
    this.inputElement.value = value;
    if (this.lastValue !== value) {
      this.lastValue = value;
      this.onChange(value)
    }
  }

  /**
   * Get native input element
   */
  protected setupMask() {
    if (!this.inputElement) {
      if (this.element.nativeElement.tagName === 'INPUT') {
        this.inputElement = this.element.nativeElement
      } else {
        this.inputElement = this.element.nativeElement.getElementsByTagName('INPUT')[0]
      }
    }
  }

  constructor(@Inject(Renderer2) protected renderer: Renderer2, @Inject(ElementRef) protected element: ElementRef) {

  }
}
