import {
  ContentChild,
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Renderer2
} from '@angular/core';
import { CvIconComponent } from '../icon/cv-icon/cv-icon.component';

@Directive({
    selector: 'button[cv-button], a[cv-button], label[cv-button], cv-button',
})
export class Button implements OnInit, OnChanges {

  @Input('size') size: 'small' | 'medium' | 'large' | string = 'medium';
  @Input('iconAlign') align: 'left' | 'right' | string = 'left';
  @Input('flatStyle') style: 'light' | 'dark' | string = 'light';
  @Input('spinnerColor') spinnerColor: string = '#fff';

  @ContentChild(CvIconComponent) icon: CvIconComponent;
  @HostBinding('class.icon-right') iconAlignRight: boolean = false;
  @HostBinding('class.icon-left') iconAlignLeft: boolean = false;
  @HostBinding('class.-dark') darkStyle: boolean = false;
  @Input() @HostBinding('class.-loading') loading: boolean = false;

  @HostListener('click', ['$event']) onClick(event: Event): void {
    (event.target as HTMLElement).blur();
  }

  constructor(protected el: ElementRef, protected renderer: Renderer2) {
  }

  ngOnInit(): void {
    this.iconAlignRight = this.icon && this.align == 'right';
    this.iconAlignLeft = this.icon && this.align == 'left';
    this.darkStyle = this.style == 'dark';
    this.renderer.addClass(this.el.nativeElement, `-${this.size}`);
  }

  ngOnChanges(changes): void {
    if (changes.size && changes.size.previousValue) {
      this.renderer.removeClass(this.el.nativeElement, `-${changes.size.previousValue}`);
    }
    if (changes.size && changes.size.currentValue) {
      this.renderer.addClass(this.el.nativeElement, `-${changes.size.currentValue}`);
    }
  }
}
