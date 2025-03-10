import { Component, OnInit } from '@angular/core';
import { ReviewService } from '../../../api/services/review.service';
import { ProRequestReview } from '../../../api/models/ProRequestReview';
import { PopUpMessageService } from '../../../api/services/pop-up-message.service';
import { TextMessages } from '../../../util/text-messages';
import { finalize } from "rxjs/operators";
import { ReviewRequestOption } from "../../../model/data-model";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'request-review-dialog',
  templateUrl: './request-review-dialog.component.html',
  styleUrls: ['./request-review-dialog.component.scss']
})
export class RequestReviewDialogComponent implements OnInit {
  emails: string;
  subject: string = 'Rate me on Home Improve';
  message: string = "I'm sending this to ask you if you can rate me on Home Improve. It only takes a few seconds, and would really help me.\r\n\r\nThank you\r\n";
  companyName: string;
  processing: boolean = false;
  reviewRequestOption: ReviewRequestOption;

  constructor(public currentDialogRef: MatDialogRef<any>,
              private reviewService: ReviewService,
              public messages: TextMessages,
              public popUpService: PopUpMessageService) {
  }

  close() {
    this.currentDialogRef.close();
  }


  showReviewRequestOptions(){
    this.processing = true;
    this.reviewService.getReviewRequestOptions()
      .pipe(finalize(() => this.processing = false)).subscribe(
      options => this.reviewRequestOption = options,
      err => console.error(err)
    );
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
        console.error(err);
        this.processing = false;
      }
    );
  }

  ngOnInit() {
    this.showReviewRequestOptions();
    this.message = this.message + this.companyName;
  }
}

