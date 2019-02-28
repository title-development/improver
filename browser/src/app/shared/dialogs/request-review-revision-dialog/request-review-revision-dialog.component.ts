import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { ReviewService } from '../../../api/services/review.service';
import { ProRequestReview } from '../../../api/models/ProRequestReview';
import { PopUpMessageService } from '../../../util/pop-up-message.service';
import { Company } from '../../../api/models/Company';
import { CompanyService } from '../../../api/services/company.service';
import { SecurityService } from "../../../auth/security.service";
import { Review } from "../../../model/data-model";
import { getErrorMessage } from "../../../util/functions";
import { Messages } from "../../../util/messages";

@Component({
  selector: 'request-review-dialog',
  templateUrl: './request-review-revision-dialog.component.html',
  styleUrls: ['./request-review-revision-dialog.component.scss']
})
export class RequestReviewRevisionDialogComponent implements OnInit {
  public review: Review;
  processing: boolean = false;
  model = {
    message: ''
  };

  constructor(public currentDialogRef: MatDialogRef<any>,
              private reviewService: ReviewService,
              public popUpService: PopUpMessageService,
              private companyConfig: CompanyService,
              public securityService: SecurityService,
              public  messages : Messages) {
  }

  close() {
    this.currentDialogRef.close();
  }

  submit() {
    this.processing = true;
    this.reviewService.requestReviewRevision(this.review.id, this.model.message).subscribe(
      response => {
        this.processing = false;
        this.popUpService.showSuccess(`Review revision request to <b>${this.review.customer.name}</b> has been sent`);
        this.review.revisionRequested = true;
        this.model.message = '';
        this.close();
      },
      err => {
        this.processing = false;
        this.popUpService.showError(getErrorMessage(err))
      }
    );
  }

  ngOnInit() {

  }
}

