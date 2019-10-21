import { ComponentRef, Directive, Input, OnChanges, TemplateRef } from '@angular/core';
import { BackdropType, OverlayRef } from './overlayRef';
import { CvHolder } from './cv-holder';

@Directive({
  selector: '[cv-overlay]'
})
export class CvOverlayDirective implements OnChanges {

  @Input('cvOverlayOpen') open: boolean = false;

  private dropDownRef: ComponentRef<CvHolder>;

  constructor(private templateRef: TemplateRef<any>,
              private overlayRef: OverlayRef) {
  }

  ngOnChanges(changes) {
    if (changes && changes.open && changes.open.currentValue == true) {
      this.append();
      return;
    }

    if (changes && changes.open && changes.open.currentValue == false) {
      this.destroy();
    }
  }

  private append() {
    const holder: HTMLElement = this.overlayRef.createBackdrop(BackdropType.menu, this.templateRef.elementRef.nativeElement.parentElement);
    this.dropDownRef = this.overlayRef.appendComponentToElement<CvHolder>(CvHolder, holder);
    this.dropDownRef.instance.render(this.templateRef);
  }

  private destroy() {
    if (this.dropDownRef) {
      this.overlayRef.removeBackdrop();
      this.dropDownRef.destroy();
      this.dropDownRef = null;
    }
  }
}
