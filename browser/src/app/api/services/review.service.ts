import { Injectable } from '@angular/core';
import { Pagination, Review, ReviewRevisionRequest } from '../../model/data-model';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

import { ReviewRating } from '../models/ReviewRating';
import { toHttpParams } from '../../util/functions';


import { RestPage } from '../models/RestPage';
import { ProRequestReview } from '../models/ProRequestReview';

@Injectable()
export class ReviewService {

  private companyUrl = 'api/companies';
  private reviewUrl = 'reviews';
  private optionsUrl = 'options';

  constructor(private http: HttpClient) {
  }

  getReviewOptions(companyId: any, projectRequestId: string = '0', reviewToken?: string): Observable<any> {
    const params = new HttpParams()
      .set('projectRequestId', projectRequestId)
      .set('reviewToken', reviewToken);

    return this.http
      .get(`${this.companyUrl}/${companyId}/${this.reviewUrl}/${this.optionsUrl}`, {
        responseType: 'text',
        params: params
      });
  }

  getAllReviews(filters: any, pagination: Pagination): Observable<RestPage<Review>> {
    const params = toHttpParams({...filters, ...pagination});
    return this.http.get<RestPage<Review>>(`api/${this.reviewUrl}`, {params});
  }

  getReviews(companyId: string, publishedOnly, pagination: Pagination): Observable<ReviewRating> {
    const params = toHttpParams(pagination);

    return this.http.get<ReviewRating>(`${this.companyUrl}/${companyId}/${this.reviewUrl}`, {params});
  }

  /**
   * Add new review
   *
   * @param id company id
   * @param review
   * @param projectRequestId is optional. When present means review is related to hired contractor, when absent - related to company profile.
   * @param reviewToken is optional. Token for requestReview answer.
   */
  addReview(id: any, review: Review, projectRequestId: string = '0', reviewToken?: string): Observable<any> {
    let params;
    if (reviewToken) {
      params = new HttpParams()
        .set('projectRequestId', projectRequestId)
        .set('reviewToken', reviewToken);
    } else {
      params = new HttpParams()
        .set('projectRequestId', projectRequestId);
    }


    return this.http
      .post(`${this.companyUrl}/${id}/${this.reviewUrl}`, review, {params: params, responseType: 'text'});
  }

  requestReview(requestReview: ProRequestReview): Observable<any> {
    return this.http.post(`api/${this.reviewUrl}/request`, requestReview);
  }

  requestReviewRevision(companyId, reviewId, comment): Observable<any> {
    return this.http.post(`${this.companyUrl}/${companyId}/${this.reviewUrl}/${reviewId}/revision`, comment);
  }


  getReview(reviewId: number): Observable<Review> {
    return this.http.get<Review>(`api/${this.reviewUrl}/${reviewId}`);
  }

  updateReview(review: Review): Observable<any> {
    return this.http.put(`api/${this.reviewUrl}/${review.id}/accept`, review);
  }

  declineReviewRevision(reviewId: number): Observable<any> {
    return this.http.put(`api/${this.reviewUrl}/${reviewId}/decline`, {});
  }

  getRevisionByReviewId(reviewId: number): Observable<ReviewRevisionRequest> {
    return this.http.get<ReviewRevisionRequest>(`api/${this.reviewUrl}/${reviewId}/revision`);
  }

}
