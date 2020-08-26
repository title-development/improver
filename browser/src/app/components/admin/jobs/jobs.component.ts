import { Component, OnInit } from '@angular/core';
import { JobService } from "../../../api/services/job.service";
import { PopUpMessageService } from "../../../api/services/pop-up-message.service";
import { getErrorMessage } from "../../../util/functions";

@Component({
  selector: 'admin-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class AdminJobsComponent implements OnInit {
  title = "Jobs";

  public subscriptionUpdateJobProcessing = false;
  public reviewPublishingJobProcessing = false;

  constructor(private jobService: JobService,
              private popUpService: PopUpMessageService) { }

  ngOnInit() {
  }

  runUpdateSubscriptionJob() {
    this.subscriptionUpdateJobProcessing = true;
    this.jobService.runUpdateSubscriptionJob().subscribe(
      response => {
        this.subscriptionUpdateJobProcessing = false;
        this.popUpService.showSuccess("<b>Subscription job</b> finished successfully")
      },
      err => {
        this.subscriptionUpdateJobProcessing = false;
        if (err.status == 409) {
          this.popUpService.showError("<b>Subscription job</b> is locked for a while. Please try again later.")
        } else {
          this.popUpService.showError(getErrorMessage(err))
        }
      }
    )
  }

  runPublishReviewJob() {
    this.reviewPublishingJobProcessing = true;
    this.jobService.runPublishReviewJob().subscribe(
      response => {
        this.reviewPublishingJobProcessing = false;
        this.popUpService.showSuccess("<b>Review publishing job</b> finished successfully")
      },
      err => {
        this.reviewPublishingJobProcessing = false;
        if (err.status == 409) {
          this.popUpService.showError("<b>Review publishing job</b> is locked for a while. Please try again later.")
        } else {
          this.popUpService.showError(getErrorMessage(err))
        }
      }
    )
  }

}
