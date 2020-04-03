import { Directive, ElementRef, OnDestroy, Renderer2 } from "@angular/core";
import { Subscription } from "rxjs";
import { MediaChange, MediaObserver } from "@angular/flex-layout";

/**
 * @deprecated Not used anywhere and braked after migration to Angular 9
 */
@Directive({selector: '[observeMedia]'})
export class ObserveMediaDirective implements OnDestroy{

  watcher: Subscription;
  activeMediaQuery = "";
  fxMediaClasses = ['xs', 'sm', 'md', 'lg', 'xl'];

  constructor(private element: ElementRef, private renderer: Renderer2, mediaObserver: MediaObserver) {

    this.watcher = mediaObserver.asObservable().subscribe((changes: MediaChange[]) => {
      // this.activeMediaQuery = changes ? `'${changes.mqAlias}' = (${changes.mediaQuery})` : "";
      // this.removeFxMediaClasses(element);
      // this.addFxMediaLtClasses(element, this.fxMediaClasses.indexOf(change.mqAlias));
      // this.addFxMediaGtClasses(element, this.fxMediaClasses.indexOf(change.mqAlias));
    });

    renderer.addClass(element.nativeElement, "fxClass-lt-md");
  }

  removeFxMediaClasses(element){
    for (let mediaPrefix of this.fxMediaClasses) {
      this.renderer.removeClass(element.nativeElement, "fxClass-lt-" + mediaPrefix);
      this.renderer.removeClass(element.nativeElement, "fxClass-gt-" + mediaPrefix);
    }
  }

  addFxMediaLtClasses(element, index){
    for(let i = index + 1; i < this.fxMediaClasses.length; i++) {
      this.renderer.addClass(element.nativeElement, "fxClass-lt-" + this.fxMediaClasses[i]);
    }
  }

  addFxMediaGtClasses(element, index){
    for(let i = 0; i < index; i++) {
      this.renderer.addClass(element.nativeElement, "fxClass-gt-" + this.fxMediaClasses[i]);
    }
  }

  ngOnDestroy() {
    this.watcher.unsubscribe();
  }

}
