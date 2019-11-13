import { Inject, Injectable } from "@angular/core";
import { DOCUMENT, Location, LocationStrategy } from "@angular/common";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs/operators";

@Injectable({providedIn: 'root'})
export class NavigationHelper {

  previousUrl: string;
  currentUrl: string;
  private _useNativeHandling = true;

  constructor(private ngLocation: Location,
              private router: Router,
              private locationStrategy: LocationStrategy,
              @Inject('Window') private window: Window,
              @Inject(DOCUMENT) private document: Document) {
    router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        this.previousUrl = this.currentUrl;
        this.currentUrl = (event as NavigationEnd).url;
      });

  }

  /**
   * Returns to previous url or alternative url if previous is not present in app memory
   * @param {string} alternativeUrl
   * */
  back(alternativeUrl?: string) {
    if (this.previousUrl) {
      this.ngLocation.back();
    } else {
      if (alternativeUrl) {
        this.router.navigate([alternativeUrl])
      } else {
        this.ngLocation.back();
      }
    }

  }

  /** Clear hash fragment from url (projects/123#4 => projects/123) */
  removeHash() {
    this.router.navigate([]);
  }

  /** Prevents browser back button functionality. Click will be prevented only once. */
  preventNativeBackButton() {
    this.window.history.pushState(null, this.document.title, this.router.url);
  }

}
