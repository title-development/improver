import { Injectable } from '@angular/core';
import { MediaQuery, MediaQueryService } from "./media-query.service";

@Injectable({
  providedIn: 'root'
})
export class DeviceControlService {

  mediaQuery: MediaQuery;

  constructor(private mediaQueryService: MediaQueryService) {
    this.subscribeMediaScreen();
  }

  subscribeMediaScreen() {
    this.mediaQueryService.screen
        .subscribe(mediaQuery => {
          this.mediaQuery = mediaQuery;
        })
  }

  public isAndroid(event): boolean {
    if (this.isMobileScreen() && this.isKeypressedEnter(event)) {
      return /android/i.test(navigator.userAgent);
    }
  }

  public isIOS(): boolean {
    if (this.isMobileScreen()) {
      return /iPad|iPhone|iPod/.test(navigator.userAgent);
    }
  }

  private isMobileScreen(): boolean {
    return this.mediaQuery.xs || this.mediaQuery.sm;
  }

  private isKeypressedEnter(event: KeyboardEvent): boolean {
    return event.key == 'Enter';
  }
}
