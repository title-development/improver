import { Directive, ElementRef, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Directive({
  selector: '[cvGlue]',
  exportAs: 'cvGlue',
  host: {
    '[class.-disabled]': '!enabled'
  }
})
export class GlueBlockDirective implements OnInit, OnDestroy {

  @Input('cvGlue') enabled: boolean = true;
  @Input('cvGlueParent') parent: HTMLElement;
  @Input() headerHeight: number;
  @Input() offset: number;

  private elRect: ClientRect;
  private parentRect: { height: number; top: number } = {height: -1, top: -1};
  private offsetSum: number;
  private fixedTop: boolean = false;
  private fixedBottom: boolean = false;
  private glueTop: boolean = true;
  private glueBottom: boolean = false;
  private windowHeight: number;
  private direction: 'up' | 'down' = 'down';
  private oldScrollTop: number = 0;
  private updateInterval: any;
  private intervalStep: number = 100;
  private oldElHeight: number = -1;
  private oldParHeight: number = -1;
  private maxCheckAttempt: number = 10;
  private timeOut: any;
  private glue: boolean = false;

  // Hack to get scroll container
  // todo implement this by directive
  private scrollHolder: Element;
  scrollHandler = () => this.onScroll();
  resizeHandler = () => this.onResize();

  constructor(private element: ElementRef,
              @Inject(DOCUMENT) private document: any,
              @Inject('Window') private window: Window) {
    this.scrollHolder = document.documentElement;
    this.window.addEventListener('scroll', this.scrollHandler);
    this.window.addEventListener('resize', this.resizeHandler);
  }

  onScroll(): void {
    if(this.enabled) {
      this.direction = this.oldScrollTop > this.getPageScroll().y ? 'up' : 'down';
      this.oldScrollTop = this.getPageScroll().y;
      this.processing(this.getPageScroll().y, this.direction);
    }
  }

  onResize(): void {
    if (!this.enabled) {
      return;
    }
    if (!this.glue) {
      if (this.fixedTop) {
        const offsetTop = this.getPageScroll().y - this.parentRect.top + this.offsetSum;
        this.updatePosition(this.element, 'absolute', '100%', 'auto', offsetTop, 'auto');
        this.forceUpdate();
      }
      if (this.glueBottom) {
        const offsetTop = this.parentRect.height - this.elRect.height;
        this.updatePosition(this.element, 'absolute', '100%', 'auto', offsetTop, 'auto');
        this.forceUpdate();
      }
      if (this.glueTop) {
        this.forceUpdate();
      }
    }
    if (this.glue) {
      if (this.fixedBottom) {
        const offsetTop = Math.abs(((this.getPageScroll().y - this.parentRect.top)) - (this.elRect.height - this.windowHeight));
        this.updatePosition(this.element, 'absolute', '100%', 'auto', offsetTop, 'auto');
        this.forceUpdate();
        clearTimeout(this.timeOut);
        this.timeOut = setTimeout(() => {
          this.updatePosition(this.element, 'fixed', this.elRect.width, this.elRect.left, 'auto', 0);
        }, 500);
      }
      if (this.fixedTop) {
        const offsetTop = this.getPageScroll().y - this.parentRect.top + this.offsetSum;
        this.updatePosition(this.element, 'absolute', '100%', 'auto', offsetTop, 'auto');
        this.forceUpdate();
        clearTimeout(this.timeOut);
        this.timeOut = setTimeout(() => {
          this.updatePosition(this.element, 'fixed', this.elRect.width, this.elRect.left, this.offsetSum, 'auto');
        });
      }
    }
    if (!this.fixedTop && !this.fixedBottom && !this.glueTop && !this.glueBottom) {
      this.forceUpdate();
    }
  }

  processing(scrollTop: number, direction: 'up' | 'down'): void {
    if (this.parentRect.height > this.elRect.height && this.windowHeight > this.elRect.height) {
      this.inOneScreen(scrollTop);
    } else {
      this.boxWidthGlue(scrollTop, direction);
    }
  }

  ngOnInit(): void {
    this.offsetSum = this.offset + this.headerHeight;
    this.forceUpdate();
    this.updateWithAttempts();
  }

  ngOnDestroy(): void {
    this.window.removeEventListener('scroll', this.scrollHandler);
    this.window.removeEventListener('resize', this.resizeHandler);
  }

  updateWithAttempts(): void {
    if(!this.enabled) {
      return;
    }
    let times: number = 0;
    this.updateInterval = setInterval(() => {
      if (this.elRect.height != this.oldElHeight || this.parentRect.height != this.oldParHeight || times < this.maxCheckAttempt) {
        this.enabled = false;
        this.forceUpdate();
        if (this.elRect.height == this.oldElHeight || this.parentRect.height == this.oldParHeight) {
          times++;
        }
        this.oldElHeight = this.elRect.height != 0 ? this.elRect.height : -1;
        this.oldParHeight = this.parentRect.height != 0 ? this.parentRect.height : -1;
      } else {
        clearInterval(this.updateInterval);
        this.processing(this.getPageScroll().y, 'down');
        this.enabled = this.elRect.height < this.parentRect.height;
      }
    }, this.intervalStep);
  }

  forceUpdate(): void {
    this.elRect = this.element.nativeElement.getBoundingClientRect();
    this.parentRect.height = this.parent.getBoundingClientRect().height;
    this.parentRect.top = this.parent.getBoundingClientRect().top + this.getPageScroll().y;
    this.windowHeight = this.window.innerHeight;
  }

  private inOneScreen(scrollTop: number): void {
    if (scrollTop > this.parentRect.top - this.offsetSum) {
      this.fixedTop = true;
      this.glueTop = false;
      this.glueBottom = false;
      this.updatePosition(this.element, 'fixed', this.elRect.width, this.elRect.left, this.offsetSum, 'auto');
      if (scrollTop + this.elRect.height + this.offsetSum > this.parentRect.height + this.parentRect.top) {
        this.glueBottom = true;
        this.fixedTop = false;
        this.updatePosition(this.element, 'absolute', this.elRect.width, 'auto', 'auto', 0);
      }
    } else {
      this.glueTop = true;
      this.fixedTop = false;
      this.glueBottom = false;
      this.updatePosition(this.element, 'static', this.elRect.width, 'auto', 'auto', 'auto');
    }
  }

  private boxWidthGlue(scrollTop: number, direction: 'down' | 'up'): void {
    //scroll down
    if (direction === 'down') {
      if (this.fixedTop && !this.glueTop) {
        this.fixedTop = false;
        const offsetTop = scrollTop - this.parentRect.top + this.headerHeight;
        this.updatePosition(this.element, 'absolute', this.elRect.width, 'auto', offsetTop, 'auto');
        this.elRect = this.element.nativeElement.getBoundingClientRect();
      }
      //Fixed
      if (!this.fixedBottom && !this.glueBottom && (scrollTop + this.windowHeight > this.elRect.height + this.parentRect.top + this.element.nativeElement.offsetTop)) {
        this.updatePosition(this.element, 'fixed', this.elRect.width, this.elRect.left, 'auto', 0);
        this.glueTop = false;
        this.fixedBottom = true;
      }
      //Glue
      if (!this.glueBottom && this.fixedBottom && (scrollTop + this.windowHeight > this.parentRect.height + this.parentRect.top)) {
        this.updatePosition(this.element, 'absolute', this.elRect.width, 'auto', 'auto', 0);
        this.elRect = this.element.nativeElement.getBoundingClientRect();
        this.glueBottom = true;
        this.fixedTop = false;
        this.fixedBottom = false;
      }
    }
    //scroll up
    else {
      if (this.fixedBottom && !this.glueBottom) {
        this.fixedBottom = false;
        const offsetTop = Math.abs(((scrollTop - this.parentRect.top)) - (this.elRect.height - this.windowHeight));
        this.updatePosition(this.element, 'absolute', this.elRect.width, 'auto', offsetTop, 'auto');
        this.elRect = this.element.nativeElement.getBoundingClientRect();
      }
      //Fixed
      if (!this.fixedTop && !this.glueTop && (scrollTop < this.element.nativeElement.offsetTop + this.parentRect.top - this.offsetSum)) {
        this.updatePosition(this.element, 'fixed', this.elRect.width, this.elRect.left, this.offsetSum, 'auto');
        this.fixedTop = true;
        this.glueBottom = false;
      }
      //Glue
      if (!this.glueTop && this.fixedTop && (scrollTop < this.parentRect.top - this.offsetSum)) {
        this.updatePosition(this.element, 'static', this.elRect.width, 'auto', 'auto', 'auto');
        this.elRect = this.element.nativeElement.getBoundingClientRect();
        this.glueTop = true;
        this.fixedBottom = false;
        this.fixedTop = false;
      }
    }
  }

  private updatePosition(el: ElementRef,
                         position: 'fixed' | 'absolute' | 'static',
                         width: '100%' | number,
                         left: 'auto' | number,
                         top: 'auto' | number,
                         bottom: 'auto' | number): void {
    el.nativeElement.style.position = position;
    el.nativeElement.style.width = typeof width !== 'string' ? `${width}px` : width;
    el.nativeElement.style.left = typeof left !== 'string' ? `${left}px` : left;
    el.nativeElement.style.top = typeof top !== 'string' ? `${top}px` : top;
    el.nativeElement.style.bottom = typeof bottom !== 'string' ? `${bottom}px` : bottom;
  }

  /**
   * Page Scroll Offset
   * @returns {{x: number; y: number}}
   */
  private getPageScroll(): { x: number, y: number } {
    const x = (window.pageXOffset !== undefined) ? window.pageXOffset : (this.document.documentElement || this.document.body.parentNode || this.document.body).scrollLeft;
    const y = (window.pageYOffset !== undefined) ? window.pageYOffset : (this.document.documentElement || this.document.body.parentNode || this.document.body).scrollTop;

    return {x, y};
  }
}
