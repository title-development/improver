import { AfterViewInit, Component } from '@angular/core';

@Component({
  selector: 'customer-banner',
  templateUrl: 'customer-banner.component.html',
  styleUrls: ['customer-banner.component.scss']
})


export class CustomerBannerComponent implements AfterViewInit {

  swiper: Swiper;

  banners = [
    {image: 'assets/img/customer-banner-1.png',  title: 'Roofing', description: 'Simply check/uncheck services you provide specify exactly what job you do/don’t do so you always receive work you interested in'},
    {image: 'assets/img/customer-banner-2.png',  title: 'Masonry', description: 'Simply check/uncheck services you provide specify exactly what job you do/don’t do so you always receive work you interested in'},
    {image: 'assets/img/customer-banner-3.png',  title: 'Tiling', description: 'Simply check/uncheck services you provide specify exactly what job you do/don’t do so you always receive work you interested in'},
  ];

  constructor() {

  }

  ngAfterViewInit(): void {
    this.swiper = new Swiper('.swiper-container', {
      pagination: '.swiper-pagination',
      paginationClickable: true,
      nextButton: '.swiper-button-next',
      prevButton: '.swiper-button-prev',
      autoplay: 5000,
      spaceBetween: 0,
      speed: 300,
      loop: true,
    });
  }

}
