import { ElementRef, Injectable, NgZone } from '@angular/core';

@Injectable()
export class ScrollHolderService {
  scrollHolder: HTMLElement;
  private currentTime: number = 0;
  private increment: number = 20;
  private start: number;
  private duration: number = 500;
  private distance: number;
  private headerHeight: number = 50;
  private requestAnimationFrame;

  constructor(private ngZone: NgZone) {
  }

  scrollTo(target: ElementRef, delay: number = 0): void {
    this.currentTime = 0;
    this.start = this.scrollHolder.scrollTop;
    this.distance = target.nativeElement.offsetTop - this.start;
    setTimeout(()=> {
      this.animating();
    }, delay);

  }

  private easeInOutQuad(t, b, c, d): number {
    t /= d / 2;
    if (t < 1) {
      return c / 2 * t * t + b;
    }
    t--;

    return -c / 2 * (t * (t - 2) - 1) + b;
  }

  private easeInCubic(t, b, c, d): number {
    let tc = (t /= d) * t * t;

    return b + c * (tc);
  }

  private inOutQuintic(t, b, c, d): number {
    let ts = (t /= d) * t,
      tc = ts * t;

    return b + c * (6 * tc * ts + -15 * ts * ts + 10 * tc);
  }

  private animating(): void {
    this.currentTime += this.increment;
    const val = this.easeInOutQuad(this.currentTime, this.start, this.distance, this.duration) - this.headerHeight;
    this.move(val);
    if (this.currentTime < this.duration) {
      this.requestAnimationFrame = this.ngZone.runOutsideAngular(() => requestAnimationFrame(() => this.animating()));
    } else {
      cancelAnimationFrame(this.requestAnimationFrame);
    }
  }

  private move(amount): void {
    this.scrollHolder.scrollTop = amount;
  }

}
