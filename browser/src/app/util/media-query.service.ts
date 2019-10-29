import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface RsScreen {
  name: string;
  min: number;
  max: number;
}

export interface MediaQuery {
  xs?: boolean;
  sm?: boolean;
  md?: boolean;
  lg?: boolean;
  xlg?: boolean;
}

@Injectable()
export class MediaQueryService {
  screen: BehaviorSubject<MediaQuery>;
  private windowWidth: number;
  private screens: Array<RsScreen> = [
    {
      name: 'xs',
      min: 0,
      max: 576
    },
    {
      name: 'sm',
      min: 577,
      max: 767
    },
    {
      name: 'md',
      min: 768,
      max: 1023
    },
    {
      name: 'lg',
      min: 1024,
      max: 1199
    },
    {
      name: 'xlg',
      min: 1200,
      max: 9999
    }
  ];
  private lastMedia = {};

  constructor(private ngZone: NgZone) {
    this.screen = new BehaviorSubject<MediaQuery>(this.getTheScreen());
    window.onresize = (e) => {
      ngZone.run(() => {
        let media = this.getTheScreen();
        if (JSON.stringify(media) !== JSON.stringify(this.lastMedia)) {
          this.screen.next(media);
        }
      });
    };
  }

  private getTheScreen(): MediaQuery {
    this.windowWidth = window.innerWidth;
    const media: MediaQuery = {};
    for (const screen of this.screens) {
      media[screen.name] = this.windowWidth >= screen.min && this.windowWidth <= screen.max;
    }
    return media;
  }

}
