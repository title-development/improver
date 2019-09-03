import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

declare let hj: Function;

@Injectable({providedIn: 'root'})
export class HotJarService {
  private readonly debug = true;
  private readonly hotJarVersion = 6;

  constructor() {
    // if (!environment.production) return;
    this.injectScript();
  }

  private injectScript(): void {
    const debug = this.debug;
    const hotJarVersion = this.hotJarVersion;
    (function (h: any, o: any, t: any, j: any, a?: any, r?: any) {
      h.hj = h.hj || function () {
        (h.hj.q = h.hj.q || []).push(arguments);
      };

      h._hjSettings = {hjid: environment.hotJarTrackingId, hjsv: hotJarVersion};
      if (debug) {
        h._hjSettings = {...h._hjSettings, ...{hjdebug: true}};
      }
      a = o.getElementsByTagName('head')[0];

      r = o.createElement('script');
      r.async = 1;
      r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;

      a.appendChild(r);

    })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
  }

  ping(): void {
    if (hj) {
      hj('vpv', 'homePage');
      hj('trigger', 'homePage');
      hj('stateChange', 'homePage');
      hj('tagRecording', 'homePage');
    }
  }
}
