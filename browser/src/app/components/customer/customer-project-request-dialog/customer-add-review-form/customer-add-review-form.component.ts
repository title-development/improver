import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Review, SystemMessageType } from "../../../../model/data-model";
import { NgForm } from "@angular/forms";
import { PopUpMessageService } from "../../../../api/services/pop-up-message.service";
import { ReviewService } from "../../../../api/services/review.service";
import { animate, state, style, transition, trigger } from "@angular/animations";
import { ProjectRequestService } from "../../../../api/services/project-request.service";
import { ProjectRequest } from '../../../../api/models/ProjectRequest';
import { Constants } from '../../../../util/constants';
import { getErrorMessage } from "../../../../util/functions";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: 'customer-add-review-form',
  templateUrl: './customer-add-review-form.component.html',
  styleUrls: ['./customer-add-review-form.component.scss'],
  animations: [

    trigger('collapse', [
      state('inactive', style({
        opacity: 0,
        height: '0px'
      })),
      state('active', style({
        opacity: 1,
        height: '74px'
      })),
      transition('active <=> inactive', animate('200ms ease-in'))
    ]),

    trigger('collapseTextArea', [
      state('inactive', style({
        height: '42px'
      })),
      state('active', style({
        height: '96px'
      })),
      transition('active <=> inactive', animate('200ms ease-in'))
    ])
  ]
})
export class CustomerAddReviewFormComponent implements OnInit {

  @Input() sidebar;
  @Input() projectRequest: ProjectRequest;

  showReviewForm = false;
  isRated = false;
  ProjectRequest = ProjectRequest;
  isReviewSend = false;
  isSubmitButtonDisabled: boolean = false;
  isMatDialogWindow: boolean = false;
  @Output() onLoadReviews: EventEmitter<any> = new EventEmitter<any>();

  newReview: Review = {
    score: 0
  };

  constructor(public popUpMessageService: PopUpMessageService,
              public reviewService: ReviewService,
              public constants: Constants,
              public dialog: MatDialog,
              public projectRequestService: ProjectRequestService) { }

  ngOnInit() {
  }

  getReviewRating(rating) {
    this.isRated = true;
    this.newReview.score = rating;
  }

  addReview(reviewForm: NgForm) {
    if (!this.projectRequest.reviewed && reviewForm.valid) {
      this.isSubmitButtonDisabled = true;

      if (this.isRated && this.newReview.description.trim().length > 2) {
        this.reviewService.addReview(this.projectRequest.company.id, this.newReview, this.projectRequest.id)
            .subscribe(response => {
                this.newReview = {};
                this.newReview.score = 1;
                this.showReviewForm = false;
                this.isRated = false;
                this.isReviewSend = true;
                this.newReview.description = '';
                reviewForm.resetForm();
                this.updateProjectRequest();
                this.onLoadReviews.emit(this.isReviewSend);
                this.popUpMessageService.showSuccess("Review is published")
              },
              err => {
                console.error(err);
                this.isSubmitButtonDisabled = false;
                this.popUpMessageService.showError(getErrorMessage(err))
                this.dialog.closeAll();

              }
            );
      }
    }
  }

  deactivateForm(){
    this.onLoadReviews.emit(this.isReviewSend);
  }

  updateProjectRequest() {
    this.projectRequestService.getProjectRequest(this.projectRequest.id).subscribe(
      projectRequest => {
        this.projectRequest = projectRequest;
      },
      err => {
        console.error(err);
      }
    )
  }

}
