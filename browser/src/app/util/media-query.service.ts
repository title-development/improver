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

  constructor(private ngZone: NgZone) {
    this.screen = new BehaviorSubject<MediaQuery>(this.getTheScreen());
    window.onresize = (e) => {
      ngZone.run(() => {
        this.screen.next(this.getTheScreen());
      });
    };
  }

  private getTheScreen(): MediaQuery {
    this.windowWidth = window.innerWidth;
    const resp: MediaQuery = {};
    for (const screen of this.screens) {
      resp[screen.name] = this.windowWidth >= screen.min && this.windowWidth <= screen.max;
    }

    return resp;
  }

}
