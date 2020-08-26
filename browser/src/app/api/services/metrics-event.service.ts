import { Injectable } from '@angular/core';
import { HotJarService } from "./hotjar.service";
import { GoogleAnalyticsService } from "./google-analytics.service";
import { FacebookPixelService } from "./facebook-pixel.service";


@Injectable({providedIn: 'root'})
export class MetricsEventService {

  constructor(private hotJarService: HotJarService,
              private facebookPixelService: FacebookPixelService,
              private googleAnalyticsService: GoogleAnalyticsService) {
  }

  fireProjectRequestedEvent() {
    this.facebookPixelService.fbq('track', 'Lead');
    this.hotJarService.tagRecording(['Lead']);
    this.googleAnalyticsService.event('Lead', {event_category:'Process finished', description: 'Lead created by customer'})
  }

  fireBecameProPageViewEvent() {
    this.facebookPixelService.fbq('track', 'Become a pro (page view)');
    this.hotJarService.tagRecording(['Become a pro (page view)']);
    this.googleAnalyticsService.event('Become a pro (page view)', {event_category:'Page view', description: 'Visiting Become a pro page'})
  }

  fireBecameProRegistrationClickEvent() {
    this.facebookPixelService.fbq('track', 'Become a pro (registration button click)');
    this.hotJarService.tagRecording(['Become a pro (registration button click)']);
    this.googleAnalyticsService.event('Become a pro (registration button click)', {event_category:'CTA click', description: 'A button that starts pro registration'})
  }

}
