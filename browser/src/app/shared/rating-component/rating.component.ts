import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';

@Component({
  selector: 'rating-component',
  templateUrl: 'rating.component.html',
  styleUrls: ['rating.component.scss']
})

export class RatingComponent implements OnInit {
  @Input() rating: number = 0;
  @Input() starSize: number = 16;
  @Input() spaceSize: number = 5;
  @Input() readOnly: boolean = true;
  @Output() onRatingChange = new EventEmitter<number>();

  MAX_STARS = 5;
  fullStarsCount: number;
  allStarsArray = [];
  hoveredStarIndex = -1;
  selectedStarIndex: number;
  ratingHints = ['Poor', 'Fair', 'Average', 'Good', 'Excellent'];

  constructor() {
    this.allStarsArray = Array(this.MAX_STARS);
  }

  ngOnInit() {

    if (!this.readOnly) {
      this.selectedStarIndex = this.rating;
    }
    else {
      this.selectedStarIndex = 0;
    }

    this.fullStarsCount = Math.floor(this.rating);

    let remainder = this.rating - this.fullStarsCount;

    if (remainder > 0.25) {
      if (remainder < 0.75) {

      } else {
        this.fullStarsCount++;
      }
    }
  }

  getHint(index) {
    if (!this.readOnly) {
      return this.ratingHints[index];
    }
    else {
      return '';
    }
  }

  starMouseEnter(event, index) {
    this.hoveredStarIndex = index;
  }

  starMouseLeave(event) {
    this.hoveredStarIndex = -1;
  }

  starClick(event, index) {
    this.selectedStarIndex = index + 1;
    this.onRatingChange.emit(this.selectedStarIndex);
    event.stopPropagation();
  }

}



