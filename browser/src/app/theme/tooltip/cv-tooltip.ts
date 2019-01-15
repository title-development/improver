import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'cvTooltip, [cvTooltip]',
})
export class CvTooltipDirective {

  @Input() cvTooltip: string;
  element: HTMLElement;

  constructor(private elementRef: ElementRef) {
    this.element = this.elementRef.nativeElement;
  }

  @HostListener('mouseover', ['$event'])
  showTooltip(event: MouseEvent): void {

  }

  @HostListener('mouseout', ['$event'])
  hideTooltip(event: MouseEvent): void {

  }
}
