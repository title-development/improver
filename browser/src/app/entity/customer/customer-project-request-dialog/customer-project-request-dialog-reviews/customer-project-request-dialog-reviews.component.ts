import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Pagination, Review } from '../../../../model/data-model';
import { ReviewService } from '../../../../api/services/review.service';
import { PopUpMessageService } from '../../../../util/pop-up-message.service';
import { ProjectActionService } from '../../../../util/project-action.service';
import { ProjectRequestService } from '../../../../api/services/project-request.service';

import { ReviewRating } from '../../../../api/models/ReviewRating';
import { RestPage } from '../../../../api/models/RestPage';
import { MediaQuery, MediaQueryService } from '../../../../util/media-query.service';
import { Subscription } from 'rxjs';

import { ProjectRequest } from '../../../../api/models/ProjectRequest';
import { distinctUntilChanged } from 'rxjs/internal/operators';

@Component({
  selector: 'customer-project-request-dialog-reviews',
  templateUrl: './customer-project-request-dialog-reviews.component.html',
  styleUrls: ['./customer-project-request-dialog-reviews.component.scss'],
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
export class CustomerProjectRequestDialogReviewsComponent implements OnInit, OnChanges, OnDestroy {

  @Input() newReviewStatus: false;
  @Input() projectRequest;
  @Output() showAddReviewForm: EventEmitter<any> = new EventEmitter();
  ProjectRequest = ProjectRequest;
  reviewsPage: RestPage<Review>;
  reviews: Array<Review>;
  pagination: Pagination = new Pagination(0, 4);
  mediaQuery: MediaQuery;
  private mediaWatcher: Subscription;
  private onProjectsUpdate$: Subscription;

  constructor(
    public reviewService: ReviewService,
    public popUpMessageService: PopUpMessageService,
    public projectActionService: ProjectActionService,
    private query: MediaQueryService,
    public projectRequestService: ProjectRequestService) {

    this.mediaWatcher = this.query.screen.pipe(
      distinctUntilChanged()
    ).subscribe((res: MediaQuery) => {
      this.mediaQuery = res;
    });
    this.onProjectsUpdate$ = this.projectActionService.onProjectsUpdate.subscribe(() => {
      this.getProjectRequest(this.projectRequest.id);
    });
  }

  ngOnInit() {
    this.loadReviews();
  }

  ngOnChanges() {
    if (this.newReviewStatus) {
      this.loadReviews();
    }
  }

  leaveFeedback() {
    this.showAddReviewForm.emit();
  }

  updateReviews() {
    this.loadReviews();
  }

  getProjectRequest(projectRequestId) {
    this.projectRequestService.getProjectRequest(projectRequestId).subscribe(
      projectRequest => {
        this.projectRequest = projectRequest;
      },
      err => {
        console.error(err);
      }
    );
  }

  showMoreReviews() {
    this.reviewService.getReviews(this.projectRequest.company.id, false, this.pagination.nextPage()).subscribe(
      (reviewRating: ReviewRating) => {
        this.reviews.push(...reviewRating.reviews.content);
        this.reviewsPage = reviewRating.reviews;
      },
      err => {
        console.error(err);
      }
    );
  }

  loadReviews() {
    this.reviewService.getReviews(this.projectRequest.company.id, false, this.pagination).subscribe(
      (reviewRating: ReviewRating) => {
        this.reviews = reviewRating.reviews.content;
        this.reviewsPage = reviewRating.reviews;
      },
      err => {
        console.error(err);
      }
    );
  }

  ngOnDestroy(): void {
    if (this.onProjectsUpdate$) {
      this.onProjectsUpdate$.unsubscribe();
    }
    if (this.mediaWatcher) {
      this.mediaWatcher.unsubscribe();
    }
  }
}
