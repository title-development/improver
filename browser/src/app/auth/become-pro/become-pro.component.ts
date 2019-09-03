import { AfterViewInit, Component } from '@angular/core';

import { SecurityService } from '../security.service';
import { Constants } from '../../util/constants';
import { Messages } from 'app/util/messages';
import * as Swiper from 'swiper/dist/js/swiper.min';
import { GoogleAnalyticsService } from '../../util/google-analytics.service';
import { HotJarService } from '../../util/hotjar.service';

@Component({
  selector: 'become-pro-page',
  templateUrl: 'become-pro.component.html',
  styleUrls: ['become-pro.component.scss', './pro-steps.scss']
})


export class BecomeProComponent implements AfterViewInit {
  step = 1;
  private swiperConfigOne: SwiperOptions = {
    spaceBetween: 0,
    centeredSlides: true,
    slidesPerView: 1,
    touchRatio: 0.2,
    loop: false,
    pagination: '.swiper-pagination',
    paginationClickable: true,
    keyboardControl: false,
    initialSlide: 1,
    onSlideChangeStart: (swiper: Swiper) => {
      if(this.swiperNav) {
        this.swiperNav.slideTo(swiper.realIndex);
      }
    }
  };
  private swiperConfigNav: SwiperOptions = {
    spaceBetween: 0,
    centeredSlides: true,
    slidesPerView: 3,
    touchRatio: 0.2,
    loop: false,
    loopedSlides: 3,
    initialSlide: 1,
    onClick: (swiper: Swiper) => {
      if(this.swiperBody) {
        this.swiperBody.slideTo(swiper.clickedIndex);
      }
    }
  };
  private swiperNav: Swiper;
  private swiperBody: Swiper;

  constructor(public securityService: SecurityService,
              public constants: Constants,
              public messages: Messages,
              private googleAnalyticsService: GoogleAnalyticsService,
              private hotJarService: HotJarService
              ) {

  }

  nextSlide(): void {
    this.swiperNav.slideNext();
    this.swiperBody.slideNext();
  }

  prevSlide(): void {
    this.swiperNav.slidePrev();
    this.swiperBody.slidePrev();
  }

  ngAfterViewInit(): void {
    this.hotJarService.ping();
    this.swiperBody = new Swiper('.testimonials-body', this.swiperConfigOne);
    this.swiperBody.disableMousewheelControl();
    this.swiperNav = new Swiper('.testimonials-nav', this.swiperConfigNav);
    this.swiperNav.disableMousewheelControl();
    this.swiperNav.disableTouchControl();
  }

  gTagTrackClick(): void {
    this.googleAnalyticsService.event('seen/read become a pro', {event_category:'Seen', description: 'seen or read content'})
  }
}
