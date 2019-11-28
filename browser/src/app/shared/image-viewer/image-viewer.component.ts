import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import * as Swiper from 'swiper/dist/js/swiper.min';

@Component({
  selector: 'image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss']
})
export class ImageViewerComponent implements OnInit {

  @Input() gallery;
  @Input() galleryActiveIndex;

  public galleryTop;
  public galleryThumbs;

  public sliderContentIsLoading: boolean;

  constructor(public currentDialogRef: MatDialogRef<any>, @Inject('Window') private window: Window) {
    this.sliderContentIsLoading = true;
  }

  ngOnInit() {
    this.currentDialogRef
      .afterOpen()
      .subscribe(() => {
        this.galleryTop = new Swiper('.gallery-top', {
          realIndex: this.galleryActiveIndex,
          nextButton: '.swiper-button-next',
          prevButton: '.swiper-button-prev',
          spaceBetween: 10,
          centeredSlides: true,
          slidesPerView: 'auto',
          keyboardControl: true,
          touchRatio: 0.2,
          loop: true,
          nextSlideMessage: 'next',
          slideToClickedSlide: true
        });
        this.galleryThumbs = new Swiper('.gallery-thumbs', {
          realIndex: this.galleryActiveIndex,
          spaceBetween: 10,
          centeredSlides: true,
          slidesPerView: 'auto',
          touchRatio: 0.2,
          loop: true,
          slideToClickedSlide: true
        });
        this.galleryTop.params.control = this.galleryThumbs;
        this.galleryThumbs.params.control = this.galleryTop;
        this.galleryTop.slideTo(this.galleryActiveIndex);

        if (this.window.innerWidth >= 577) {
          this.galleryThumbs.slideTo(this.galleryActiveIndex);
        }
      });

    setTimeout(() => {
      this.sliderContentIsLoading = false;
    }, 1000);
  }

  close() {
    this.currentDialogRef.close();
  }
}

