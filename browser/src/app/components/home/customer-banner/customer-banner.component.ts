import { AfterViewInit, Component } from '@angular/core';

@Component({
  selector: 'customer-banner',
  templateUrl: 'customer-banner.component.html',
  styleUrls: ['customer-banner.component.scss']
})


export class CustomerBannerComponent implements AfterViewInit {

  swiper: Swiper;

  banners = [
    {image: 'assets/img/customer-banner-1.png',  title: 'Trust us with your next renovation project.', description: 'No matter where your home improvement journey takes you, the Home Improve Guarantee is here to give you peace of mind that your home, and your family, are in good hands.'},
    {image: 'assets/img/customer-banner-2.png',  title: 'Trust us team with your next renovation project.', description: 'No matter where your home improvement journey takes you, the Home Improve Guarantee is here to give you peace of mind that your home, and your family, are in good hands.'},
    {image: 'assets/img/customer-banner-3.png',  title: 'Trust us with your next renovation project.', description: 'No matter where your home improvement journey takes you, the Home Improve Guarantee is here to give you peace of mind that your home, and your family, are in good hands.'},
  ];

  constructor() {

  }

  ngAfterViewInit(): void {
    this.swiper = new Swiper('.swiper-container', {
      pagination: '.swiper-pagination',
      paginationClickable: true,
      paginationBulletRender: (swiper, index, className) => {
        return '<span class="' + className + '"></span>';
      },
      nextButton: '.swiper-button-next',
      prevButton: '.swiper-button-prev',
      autoplay: 5000,
      spaceBetween: 0,
      speed: 300,
      loop: true,
    });
  }

}
