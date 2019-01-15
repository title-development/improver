import {
  Component,
  ComponentRef,
  Directive,
  ElementRef,
  HostListener,
  Inject, Input,
  Renderer2,
  ViewChild
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BackdropType, OverlayRef } from '../util/overlayRef';
import { CvHintComponent } from './cv-hint.component';

@Directive({
  selector: '[cv-hint]'
})
export class CvHintDirective {
  private opened: boolean = false;
  private dropDownRef: ComponentRef<CvHintComponent>;
  @Input('cv-hint') hintTitle: string = '';

  constructor(@Inject(DOCUMENT) private document: any,
              private renderer: Renderer2,
              private overlayRef: OverlayRef,
              private elementRef: ElementRef) {
  }

  @HostListener('mouseover', ['$event'])
  showTooltip(event: MouseEvent): void {
    if (!this.opened) {
      this.opened = true;
      const holder: HTMLElement = this.overlayRef.createBackdrop(BackdropType.noEvent, this.elementRef.nativeElement, 'up');
      this.dropDownRef = this.overlayRef.appendComponentToElement<CvHintComponent>(CvHintComponent, holder);
      this.dropDownRef.instance.hintTitle = this.hintTitle;
    }
  }

  @HostListener('mouseout', ['$event'])
  hideTooltip(event: MouseEvent): void {
    if (this.opened) {
      this.opened = false;
      this.overlayRef.removeBackdrop();
    }
  }
}
