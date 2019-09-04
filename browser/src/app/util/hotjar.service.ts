import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

declare let hj: Function;

@Injectable({providedIn: 'root'})
export class HotJarService {
  private readonly debug = false;
  private readonly hotJarVersion = 6;

  constructor() {
    // if (!environment.production) return;
    this.injectScript();
  }

  /**
   * allows you to track a URL even if your visitors did not actually have that URL loaded in their browser
   * @example hj('vpv', '/some/path');
   * @param path
   */
  virtualPageView(path: string): void {
    if(hj) {
      hj('vpv', path);
    }
  }

  /**
   * Javascript trigger Heatmaps
   * @example hj('trigger', 'split_test_a');
              hj('trigger', 'split_test_b');
   * @param code
   */
  trigger(code: string): void {
    if(hj) {
      hj('trigger', code);
    }
  }

  /**
   * Tagging your Recordings allows you to note specific actions, like CTA clicks, sign-ups, or visitor states.
   * @example hj('tagRecording', ['tag1', 'tag2']);
   * @param tags
   */
  tagRecording(tags: string[]): void {
    if(hj) {
      hj('tagRecording', tags);
    }
  }

  /**
   * Manually track page change
   * @example hj('stateChange', 'some/relative/path');
   * @param path
   */
  stateChange(path: string): void {
    if(hj) {
      hj('stateChange', path);
    }
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

}
