import {
  Directive, ElementRef, HostBinding, HostListener, Inject, Input, OnChanges, OnInit,
  Renderer2
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Directive({
  selector: '[cvSpinner]'
})
export class CvSpinnerDirective implements OnInit, OnChanges {

  @Input('cvSpinner') toggle: boolean;
  @Input('cvSpinnerColor') color: string;
  @Input('cvSpinnerSize') size: number;
  @Input('cvSpinnerBackground') background: boolean;
  @Input('cvSpinnerBackgroundColor') backgroundColor: string = '#ffffff';
  @HostBinding('class.spinner-wrapper') wrapper: boolean;
  spinner: HTMLElement;
  spinnerWrapper: HTMLElement;

  constructor(private elementRef: ElementRef,
              private renderer: Renderer2,
              @Inject(DOCUMENT) private document: any) {
  }

  ngOnChanges(changes): void {
    if (changes.toggle) {
      this.addOrRemoveSpinner(changes.toggle.currentValue);
    }
    this.wrapper = changes.toggle.currentValue;
  }

  ngOnInit(): void {
  }

  addOrRemoveSpinner(create: boolean): void {
    if (create && !this.spinnerWrapper) {
      this.spinnerWrapper = this.document.createElement('div');
      this.spinnerWrapper.className = 'cv-spinner-holder';
      this.spinnerWrapper.className += this.background ? ' -background' : '';
      this.spinnerWrapper.style.backgroundColor = this.background ? this.backgroundColor : 'transparent';
      this.spinner = this.document.createElement('div');
      this.spinner.className = 'cv-spinner';
      this.spinner.style.width = `${this.size}px`;
      this.spinner.style.height = `${this.size}px`;
      this.spinner.style.borderColor = this.color ? this.color : '';
      this.renderer.appendChild(this.spinnerWrapper, this.spinner);
      this.renderer.appendChild(this.elementRef.nativeElement, this.spinnerWrapper);
    } else if (this.spinnerWrapper) {
      this.spinnerWrapper.remove();
      this.spinnerWrapper = undefined;
    }
  }

}
