import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CompanyProfile, Review, SystemMessageType } from '../../../../../model/data-model';
import { CompanyService } from '../../../../../api/services/company.service';
import { PopUpMessageService } from '../../../../../util/pop-up-message.service';
import { ReviewService } from '../../../../../api/services/review.service';
import { ProjectRequest } from '../../../../../api/models/ProjectRequest';
import { SecurityService } from '../../../../../auth/security.service';
import { Router, RouterStateSnapshot } from '@angular/router';
import {Constants} from "../../../../../util/constants";

@Component({
  selector: 'add-company-review',
  templateUrl: 'add-company-review.component.html',
  styleUrls: ['add-company-review.component.scss']
})

export class AddCompanyReviewComponent implements OnInit {
  companyProfile: CompanyProfile;
  public isRated = false;
  public projectRequest: ProjectRequest;
  public newReview: Review = {
    score: 0
  };
  public onPostReview = new EventEmitter<any>();

  constructor(public currentDialogRef: MatDialogRef<any>,
              public companyService: CompanyService,
              public popUpMessageService: PopUpMessageService,
              public reviewService: ReviewService,
              public dialog: MatDialog,
              public securityService: SecurityService,
              private router: Router,
              public constants: Constants) {

  }

  ngOnInit() {
  }

  close() {
    this.currentDialogRef.close();
  }

  getReviewRating(rating) {
    this.isRated = true;
    this.newReview.score = rating;
  }

  addReview(reviewPostForm: NgForm) {

    if (this.isRated) {

      if (this.newReview.description.trim().length > 2) {
        const reviewToken = localStorage.getItem('review-token');
        this.reviewService.addReview(this.companyProfile.id, this.newReview, '0', reviewToken).subscribe(
          response => {
            this.newReview = {};
            this.newReview.score = 0;
            this.isRated = false;
            this.newReview.description = '';
            reviewPostForm.resetForm();
            this.onPostReview.emit();
            this.currentDialogRef.close();
            localStorage.removeItem('review-token');
          },
          err => {
            this.popUpMessageService.showMessage({text: err.message, type: SystemMessageType.ERROR});
            localStorage.removeItem('review-token');
          }
        );
      }
    }
  }

  login(): void {
    this.securityService.returnUrl = this.router.url;
    this.router.navigate([ '/login' ]);
    this.currentDialogRef.close();
  }

  signUp(): void {
    this.securityService.returnUrl = this.router.url;
    this.router.navigate([ '/signup' ]);
    this.currentDialogRef.close();
  }
}
