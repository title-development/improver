import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  TemplateRef, ViewChild,
  ViewContainerRef
} from '@angular/core';

@Component({
  selector: 'cv-holder',
  template: '<ng-template #template></ng-template>',
})
export class CvHolder {

  @ViewChild('template', {read: ViewContainerRef}) template: ViewContainerRef;
  constructor() {
  }

  render(templateRef) {
    const viewRef = this.template.createEmbeddedView(templateRef);
    viewRef.detectChanges();
  }
}
