import { Directive, ElementRef, Inject, OnChanges, Renderer2, SimpleChanges } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

@Directive()
export class MaskDirective implements ControlValueAccessor, OnChanges {

  public inputElement: HTMLInputElement;
  public lastValue: any;

  public onTouched = () => {
  };
  public onChange = (_: any) => {
  };

  writeValue(value: any): void {
    if (value) {
      this.onInput(null, value);
    } else {
      this.onInput(null, '');
    }
  }

  registerOnChange(fn: (value: any) => any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.renderer.setProperty(this.element.nativeElement, 'disabled', isDisabled);
  }

  protected applyMask(value: any): any {
    return value;
  }

  /**
   * Input event listener
   * @param (value) html input value
   * @param (event) html input value
   */
  onInput(event: KeyboardEvent, value) {
    this.setupMask();
    value = this.applyMask(value);
    this.updateInput(event, value);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.setupMask();
    this.applyMask(this.inputElement.value);
  }

  /**
   * Write value to input element
   * @param value
   * @param event
   */
  protected updateInput(event: KeyboardEvent, value: any) {
    let cursorPosition: number = this.inputElement.selectionStart;
    this.inputElement.value = value;
    if (this.lastValue !== value) {
      this.lastValue = value;
      this.onChange(value);
    }
    if (event && (event as any).inputType == 'deleteContentBackward') {
      this.inputElement.focus();
      this.inputElement.setSelectionRange(cursorPosition, cursorPosition);
    }
  }

  /**
   * Get native input element
   */
  protected setupMask() {
    if (!this.inputElement) {
      if (this.element.nativeElement.tagName === 'INPUT') {
        this.inputElement = this.element.nativeElement;
      } else {
        this.inputElement = this.element.nativeElement.getElementsByTagName('INPUT')[0];
      }
    }
  }

  constructor(@Inject(Renderer2) protected renderer: Renderer2, @Inject(ElementRef) protected element: ElementRef) {

  }
}
