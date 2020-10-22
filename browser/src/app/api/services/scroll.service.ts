import { Inject, Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { first } from "rxjs/operators";

@Injectable()
export class ScrollService {

  HEADER_HEIGHT = 60;

  constructor(
    private roter: Router,
    @Inject('Window') public window: Window) {
  }

  scrollToElementByTag(name: string) {
    let element = document.getElementsByTagName(name)[0] as any;
    element.scrollIntoView();
    window.scrollBy(0, -this.HEADER_HEIGHT);
  }

  scrollToElementById(id: string) {
    if (id && id.length > 0) {
      const element = document.getElementById(id);
      if (element == null) {
        console.warn('Scroll service: element not found');
        return
      }
      element.scrollIntoView();
      window.scrollBy(0, -this.HEADER_HEIGHT);
      return;
    }
  }

  navigateAndScrollToElementById(url: string, id: string) {
    if (this.roter.url == url + '#' + id) {
      this.scrollToElementById(id);
      return;
    }
    if (url) {
      this.roter.navigate([url], {fragment: id});
    }
    this.roter.events
      .pipe(first())
      .subscribe(event => {
      if (event instanceof NavigationEnd && url == event.url) {
        this.scrollToElementById(id);
      } else {
        return;
      }
    });
  }

  navigateAndScrollToTag(url: string, tagName: string): void {
    if (this.roter.url == url) {
      this.scrollToElementByTag(tagName);
      return;
    }
    if (url) {
      this.roter.navigate([url]);
    }
    this.roter.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd && url == evt.url) {
        this.scrollToElementByTag(tagName);
      } else {
        return;
      }
    });
  }

}



