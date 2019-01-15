import { Component, Input, OnInit } from '@angular/core';
import { Review } from '../../../../../model/data-model';
import { SecurityService } from "../../../../../auth/security.service";
import { Role } from "../../../../../model/security-model";
import { ReviewService } from "../../../../../api/services/review.service";
import { PopUpMessageService } from "../../../../../util/pop-up-message.service";
import { capitalize, getErrorMessage } from "../../../../../util/functions";
import { MatDialog, MatDialogRef } from "@angular/material";
import { dialogsMap } from "../../../../../shared/dialogs/dialogs.state";
import { confirmDialogConfig, unavailabilityPeriodDialogConfig } from "../../../../../shared/dialogs/dialogs.configs";
import { SocialConnection } from "../../../../../api/models/SocialConnection";

@Component({
  selector: 'company-review-item',
  templateUrl: 'company-review-item.component.html',
  styleUrls: ['company-review-item.component.scss']
})

export class CompanyReviewItemComponent implements OnInit {
  @Input() review: Review;

  truncateRatio: number = 200;
  Role = Role;
  confirmDialogRef: MatDialogRef<any>;


  private requestReviewRevisionDialogRef: MatDialogRef<any>;

  constructor(public securityService: SecurityService,
              public reviewService: ReviewService,
              public popUpService: PopUpMessageService,
              public dialog: MatDialog,) {
  }

  ngOnInit() {
  }

  openRequestReviseDialog() {
    this.requestReviewRevisionDialogRef = this.dialog.open(dialogsMap['request-review-revision-dialog'], unavailabilityPeriodDialogConfig);
    this.requestReviewRevisionDialogRef.componentInstance.review = this.review;
    this.requestReviewRevisionDialogRef
      .afterClosed()
      .subscribe(result => {
        this.requestReviewRevisionDialogRef = null;
      });
  }

}








