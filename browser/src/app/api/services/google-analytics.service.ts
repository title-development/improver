import { NavigationEnd, Router } from '@angular/router';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { DOCUMENT } from '@angular/common';

@Injectable({providedIn: 'root'})
export class GoogleAnalyticsService {

  constructor(private router: Router,
              @Inject('Window') private window: Window,
              @Inject(DOCUMENT) private document: Document) {
    // if (!environment.production) return;
    this.injectGtmScript();
    this.injectScript();
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        gtag('config', environment.googleAnalyticsTrackingId, {page_path: event.urlAfterRedirects});
      }
    });
  }

  event(eventName: string, params: Gtag.ControlParams |  Gtag.EventParams | Gtag.CustomParams): void {
    gtag('event', eventName, params);
  }

  // Inject script to head and make a global variables
  private injectScript(): void {
    const window = this.window;
    const initialCommands = [
      { command: 'js', values: [ new Date() ] },
      { command: 'config', values: [ environment.googleAnalyticsTrackingId ] }
    ];

    window['dataLayer'] = window['dataLayer'] || [];
    window['gtag'] = window['gtag'] || function () {
      window['dataLayer'].push(arguments);
    };

    for (const command of initialCommands) {
      window['gtag'](command.command, ...command.values);
    }

    const script: HTMLScriptElement = this.document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${environment.googleAnalyticsTrackingId}`;

    const head: HTMLHeadElement = this.document.getElementsByTagName('head')[0];
    head.appendChild(script);

  }

  private injectGtmScript() {
    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({
        'gtm.start':
          new Date().getTime(), event: 'gtm.js'
      });
      var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : '';
      (<any> j).async = true;
      (<any> j).src =
        'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      f.parentNode.insertBefore(j, f);
    })(this.window, this.document, 'script', 'dataLayer', environment.googleTagsManagerId);

    const body: HTMLBodyElement = this.document.getElementsByTagName('body')[0];
    const noscript: HTMLElement = this.document.createElement('noscript');
    noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${environment.googleTagsManagerId}"
                            height="0" width="0" style="display:none;visibility:hidden"></iframe>`
    body.prepend(noscript)

  }
}
