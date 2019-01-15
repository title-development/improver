import {Component, ElementRef, Inject, OnDestroy, OnInit, Renderer2} from '@angular/core';

import {Subscription} from "rxjs";
import {MediaQueryService} from "../../../util/media-query.service";

@Component({
  selector: 'hiw-wizard',
  templateUrl: 'hiw-wizard.component.html',
  styleUrls: ['hiw-wizard.component.scss']
})


export class HiwWizardComponent implements OnInit , OnDestroy {
  step = 1;
  private scrollHolder: Element = document.getElementsByClassName('scroll-holder')[0];
  wizardIcons;
  scrollHandler = () => this.onScroll();
  private mediaQuerySubscription: Subscription;
  isMobileResolution: boolean;

  constructor(private elementRef: ElementRef,
              @Inject('Window') private window: Window,
              public mediaQuery: MediaQueryService,
              public renderer: Renderer2) {

    this.scrollHolder.addEventListener('scroll', this.scrollHandler);

    this.mediaQuerySubscription = this.mediaQuery.screen.subscribe(response => {
      if(response.xs || response.sm || response.md) {
        this.isMobileResolution = true;
      }
    });
  }

  ngOnInit() {
    this.wizardIcons = this.elementRef.nativeElement.getElementsByClassName('wizard-step-image-block');
  }

  onScroll(): void {
    if (this.isMobileResolution) {
      for(let i=0;i<this.wizardIcons.length;i++) {
        if(this.scrollHolder.scrollTop > this.scrollHolder.scrollTop + this.wizardIcons[i].getBoundingClientRect().top - 300) {
          this.renderer.addClass(this.wizardIcons[i], 'active');
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.scrollHolder.removeEventListener('scroll', this.scrollHandler);
  }
}
