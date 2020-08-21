import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import { SecurityService } from '../security.service';
import { Constants } from '../../util/constants';
import { Messages } from 'app/util/messages';
import { HotJarService } from '../../util/hotjar.service';
import { ScrollService } from "../../util/scroll.service";
import { MediaQuery, MediaQueryService } from "../../util/media-query.service";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { MetricsEventService } from "../../util/metrics-event.service";

@Component({
  selector: 'become-pro-page',
  templateUrl: 'become-pro.component.html',
  styleUrls: ['become-pro.component.scss']
})


export class BecomeProComponent implements AfterViewInit {

	proBannerConfig: any = {
		image: 'become-pro-banner.png',
		title: 'Ready to get started?',
		text: 'After you register free Home Improve business profile, you\'ll be set up to start receiving lead notifications for jobs in your area, within your scope of work',
		button: 'Get started',
		routerLink: '/signup-pro'
	};
	swiper: Swiper;
	imageSwiper: Swiper;
	mediaQuery: MediaQuery;
	private readonly destroyed$: Subject<void> = new Subject();

  testimonials = [
    {
      fullName: "Nico Funk 0",
      description: "Residence owner",
      state: "NY",
      text: "We can’t thank Home Improve enough for how simple it has been to find more leads in our service area. We used to struggle to track down quality leads, but the Home Improve process has helped us find new clients who actually need our services!"
    },
    {
      fullName: "Nico Funk 1",
      description: "Residence owner",
      state: "NY",
      text: "Signing up for Home Improve is one of the best things we’ve ever done for our home renovation company. Only paying for the leads we need has made it easy to beef-up our schedule when we want to and scale back if our circumstances dictate doing so."
    },
    {
      fullName: "Nico Funk 2",
      description: "Residence owner",
      state: "NY",
      text: "We love Home Improve! Our plumbing business has taken off since we create our PRO profile. We now have more clients than we know what to do with (a great “problem” to have!)"
    },
  ];

  benefits = [
    {
      title: 'Quality leads',
      text: 'You’ll only pay for quality leads and get refund if the client cannot be reached',
      desktopImage: 'benefit_1.svg'
    },
    {
      title: 'Find the job you want',
      text: 'You pick which leads you purchase, giving you full control over the jobs you accept',
			desktopImage: 'benefit_2.svg'
    },
    {
      title: 'Flexible schedule',
      text: 'Easily plan your monthly schedule, pause leads when you don’t want to receive ones',
			desktopImage: 'benefit_3.svg'
    },
    {
      title: '20% Off on Subscription',
      text: 'Subscribe to get first access to new leads with 20% discount',
			desktopImage: 'benefit_4.svg'
    },
    {
      title: 'Give 100$, Get 100$',
      text: 'Take advantage of Home Improve’s bonus program: earn 100$ for each referral',
			desktopImage: 'benefit_5.svg'
    },
    {
      title: 'Rapid ramp-up',
      text: 'Easily add reviews from your customer portfolio',
			desktopImage: 'benefit_6.svg'
    }
  ];


  constructor(public securityService: SecurityService,
              public constants: Constants,
              public messages: Messages,
              private hotJarService: HotJarService,
              public scrollService: ScrollService,
							private changeDetectorRef: ChangeDetectorRef,
							private mediaQueryService: MediaQueryService,
              private metricsEventService: MetricsEventService) {

		this.mediaQueryService.screen
				.pipe(takeUntil(this.destroyed$))
				.subscribe(mediaQuery => {
					this.mediaQuery = mediaQuery;
					if (mediaQuery.sm || mediaQuery.xs) {
						this.createSwipers();
					} else if ((this.swiper || this.imageSwiper) !== undefined) {
						this.swiper = undefined;
						this.imageSwiper = undefined;
					}
				});
  }

  ngAfterViewInit(): void {
    this.metricsEventService.fireBecameProPageViewEvent();
  }

	createSwipers() {
		setTimeout(() => {
			this.swiper = new Swiper('.benefits-swiper', {
				slidesPerView: 1.2,
				spaceBetween: 30,
				speed: 300,
				loop: true,
				breakpoints: {
					340: {
						slidesPerView: 1.2,
						spaceBetween: 20
					},
					450: {
						slidesPerView: 1.3,
						spaceBetween: 30
					},
					550: {
						slidesPerView: 1.5,
						spaceBetween: 30
					},
					650: {
						slidesPerView: 1.8,
						spaceBetween: 30
					},
					770: {
						slidesPerView: 2,
						spaceBetween: 30
					}
				}
			});
		},);
	}


  gTagTrackClick(): void {
    this.metricsEventService.fireBecameProRegistrationClickEvent();
  }

}
