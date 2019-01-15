import { Component, Input, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { ReviewService } from '../../../api/services/review.service';
import { ProRequestReview } from '../../../api/models/ProRequestReview';
import { PopUpMessageService } from '../../../util/pop-up-message.service';
import { Company } from '../../../api/models/Company';
import { CompanyService } from '../../../api/services/company.service';
import { Messages } from '../../../util/messages';

@Component({
  selector: 'request-review-dialog',
  templateUrl: './request-review-dialog.component.html',
  styleUrls: ['./request-review-dialog.component.scss']
})
export class RequestReviewDialogComponent implements OnInit {
  emails: string;
  subject: string = 'Rate me on Home Improve';
  message: string = 'I\'m sending this to ask you if you can rate me on Home Improve. It only takes a few seconds, and would really help me.\r\n\r\nThank you.\r\n\r\n-';
  processing: boolean = false;

  constructor(public currentDialogRef: MatDialogRef<any>,
              private reviewService: ReviewService,
              public messages: Messages,
              public popUpService: PopUpMessageService,
              private companyConfig: CompanyService) {
  }

  close() {
    this.currentDialogRef.close();
  }

  submit() {
    this.processing = true;
    this.reviewService.requestReview(new ProRequestReview(this.emails, this.subject, this.message)).subscribe(
      res => {
        this.processing = false;
        this.popUpService.showSuccess('Request review has been sent');
        this.close();
      },
      err => {
        this.processing = false;
        console.log(err);
      }
    );
  }

  ngOnInit() {

  }
}

