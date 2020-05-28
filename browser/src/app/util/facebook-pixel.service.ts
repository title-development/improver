import { Injectable } from '@angular/core';

declare let fbq: Function;

@Injectable({providedIn: 'root'})
export class FacebookPixelService {

  fbq;

  constructor() {
    this.injectScript();
  }

  private injectScript(): void {
    (function (f: any, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ?
          n.callMethod.apply(n, arguments) : n.queue.push(arguments)
      }; if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s)
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    (window as any).fbq('init', '3320760744600703');
    (window as any).fbq('track', 'Landing (page view)');
    this.fbq = fbq;
  }

}
