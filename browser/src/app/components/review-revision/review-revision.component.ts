import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subscription } from 'rxjs';
import { ReviewService } from '../../api/services/review.service';
import { switchMap } from 'rxjs/operators';
import { Review } from '../../model/data-model';
import { dialogsMap } from '../../shared/dialogs/dialogs.state';
import { confirmDialogConfig } from '../../shared/dialogs/dialogs.configs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TextMessages } from '../../util/text-messages';
import { PopUpMessageService } from '../../api/services/pop-up-message.service';
import { Constants } from '../../util/constants';

@Component({
  selector: 'review-revision',
  templateUrl: './review-revision.component.html',
  styleUrls: ['./review-revision.component.scss']
})
export class ReviewRevisionComponent implements OnDestroy {
  review: Review;
  processing: boolean = false;
  isPublished: boolean = false;
  isRatingPositive: boolean = false;
  newScore: number = 0;
  private $revisionEffects: Subscription;
  private reviewId: number;
  private confirmDialogRef: MatDialogRef<any>;

  constructor(public route: ActivatedRoute,
              private router: Router,
              public messages: TextMessages,
              public dialog: MatDialog,
              private reviewService: ReviewService,
              public constants: Constants,
              private cd: ChangeDetectorRef,
              private popUpService: PopUpMessageService) {
    this.$revisionEffects = this.route.params.pipe(
      switchMap(params => {
          if (parseInt(params['id'])) {
            this.reviewId = parseInt(params['id']);

            return this.reviewService.getReview(this.reviewId);
          } else {
            this.router.navigate(['404']);

            return of(null);
          }
        }
      ))
      .subscribe((review: Review) => {
        this.review = review;
      }, err => {
        if (err.status == 409) {
          this.isPublished = true;
        } else if (err.status == 404) {
          this.router.navigate(['404']);
        }
      });

  }

  ratingValidation(score: number): void {
    this.isRatingPositive = score > this.review.score;
    this.review.score = score;
    this.cd.detectChanges();
  }

  updateReview(): void {
    if (!this.isRatingPositive) {
      return;
    }
    this.processing = true;
    this.reviewService.updateReview(this.review).subscribe(res => {
      this.processing = false;
      this.popUpService.showSuccess('Review has been updated and published');
      this.router.navigate(['/', 'companies', this.review.company.id], {fragment: 'reviews'});
    });
  }

  declineReviewRevision() {
    let properties = {
      title: 'Decline review revision',
      message: `Selecting Decline your original review won't be changed and will be published immediately. <br> Do you want to decline review revision?`,
      OK: 'Confirm',
      CANCEL: 'Cancel'
    };
    this.confirmDialogRef = this.dialog.open(dialogsMap['confirm-dialog'], confirmDialogConfig);
    this.confirmDialogRef
      .afterClosed()
      .subscribe(result => {
        this.confirmDialogRef = null;
      });
    this.confirmDialogRef.componentInstance.properties = properties;
    this.confirmDialogRef.componentInstance.onConfirm.subscribe(
      () => {
        this.processing = true;
        this.reviewService.declineReviewRevision(this.review.id).subscribe(res => {
          this.processing = false;
          this.popUpService.showSuccess('Review revision has been declined');
          this.router.navigate(['/', 'companies', this.review.company.id], {fragment: 'reviews'});
        });
      },
      err => {
        console.error(err);
      }
    );
  }

  ngOnDestroy(): void {
    if (this.$revisionEffects) {
      this.$revisionEffects.unsubscribe();
    }
  }
}
