import { Component, ElementRef, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';

import { Subject } from "rxjs";
import { MediaQuery, MediaQueryService } from "../../../util/media-query.service";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: 'hiw-wizard',
  templateUrl: 'hiw-wizard.component.html',
  styleUrls: ['hiw-wizard.component.scss']
})


export class HiwWizardComponent implements OnInit, OnDestroy {
  private readonly destroyed$: Subject<void> = new Subject();
  mediaQuery: MediaQuery;
  isMobile = false;

  constructor(private elementRef: ElementRef,
              @Inject('Window') private window: Window,
              public mediaQueryService: MediaQueryService,
              public renderer: Renderer2) {

    this.mediaQueryService.screen
      .pipe(takeUntil(this.destroyed$))
      .subscribe(mediaQuery => {
        this.mediaQuery = mediaQuery;
        this.isMobile = mediaQuery.xs || mediaQuery.md || mediaQuery.sm;
      });

  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}

