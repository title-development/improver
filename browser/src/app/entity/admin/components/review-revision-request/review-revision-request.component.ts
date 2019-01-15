import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { LocationValidateService } from '../../../../api/services/location-validate.service';
import { ValidatedLocation } from '../../../../api/models/LocationsValidation';
import { Location, Review, ReviewRevisionRequest } from '../../../../model/data-model';
import { SelectItem } from 'primeng/primeng';
import { Constants } from '../../../../util/constants';
import { NgForm } from '@angular/forms';
import { ReviewService } from "../../../../api/services/review.service";
import { Question } from "../../../../api/models/Question";
import { PopUpMessageService } from "../../../../util/pop-up-message.service";
import { getErrorMessage } from "../../../../util/functions";

@Component({
  selector: 'review-revision-request',
  templateUrl: './review-revision-request.component.html',
  styleUrls: ['./review-revision-request.component.scss']
})
export class ReviewRevisionRequestComponent implements OnChanges {

  private _toggle: boolean = false;
  @Input() get toggle(): boolean {
    return this._toggle;
  }
  set toggle(value: boolean) {
    this.toggleChange.emit(value);
    this._toggle = value;
  }
  @Input() review: Review;
  @Output() toggleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  reviewRevisionRequest: ReviewRevisionRequest;
  processing: boolean = false;

  constructor(private reviewService: ReviewService,
              private popUpService: PopUpMessageService,
              private constants: Constants) {
  }

  onHide(event){
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.toggle && changes.toggle.currentValue === true) {
      this.getReviewRevisionRequest();
    }
  }

  getReviewRevisionRequest(){
    this.processing = true;
    this.reviewService.getRevisionByReviewId(this.review.id).subscribe(
      reviewRevisionRequest => {
        this.processing = false;
        this.reviewRevisionRequest = reviewRevisionRequest
      },
      err => {
        this.processing = false;
        this.popUpService.showError(getErrorMessage(err));
      })
  }

}
