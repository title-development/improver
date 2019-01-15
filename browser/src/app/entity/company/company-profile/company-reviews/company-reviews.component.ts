import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { CompanyProfile, Pagination, Review } from '../../../../model/data-model';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ReviewService } from '../../../../api/services/review.service';
import { ReviewRating } from '../../../../api/models/ReviewRating';
import { RestPage } from '../../../../api/models/RestPage';
import { first } from "rxjs/internal/operators";
import { SecurityService } from "../../../../auth/security.service";

@Component({
  selector: 'company-reviews',
  templateUrl: 'company-reviews.component.html',
  styleUrls: ['company-reviews.component.scss']
})

export class CompanyReviewsComponent implements OnInit, OnChanges {
  reviews: Array<Review>;
  reviewsPage: RestPage<Review>;
  postReviewDialogRef: MatDialogRef<any>;
  pagination: Pagination = new Pagination(0, 3);
  reviewsLoading: boolean = false;

  @Input() companyReviewsSidebar: boolean = false;
  @Input() reviewsTitle = 'Reviews';
  @Input() companyProfile: CompanyProfile;
  @Input() editMode: boolean;
  @Output() loadMore: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private reviewService: ReviewService,
              public dialog: MatDialog,
              public securityService: SecurityService) {

  }

  ngOnInit(): void {
    this.getReviews();
  }

  ngOnChanges(changes: SimpleChanges) {
    const editMode: SimpleChange = changes.name;
    if (editMode && editMode.previousValue != undefined) {
      this.getReviews();
    }
  }

  getReviews(): void {
    this.reviewsLoading = true;
    this.reviewService.getReviews(this.companyProfile.id, !this.editMode, this.pagination).pipe(
      first()
    ).subscribe(
      (reviewRating: ReviewRating) => {
        this.reviewsPage = reviewRating.reviews;
        this.reviews = reviewRating.reviews.content;
        this.reviewsLoading = false;
      },
      err => {
        console.log(err);
        this.reviewsLoading = false;
      }
    );
  }

  showMoreReviews(): void {
    this.reviewService.getReviews(this.companyProfile.id, !this.editMode, this.pagination.nextPage()).subscribe(
      (reviewRating: ReviewRating) => {
        this.loadMore.emit(true);
        this.reviewsPage = reviewRating.reviews;
        this.reviews.push(...reviewRating.reviews.content);
      },
      err => {
        this.loadMore.emit(false);
        console.log(err);
      }
    );
  }

  trackById(index, item: Review) {
    return item.id;
  }

}
