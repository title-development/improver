import { Review } from '../../model/data-model';
import { RestPage } from './RestPage';

export class ReviewRating {
  rating: number;
  reviews: RestPage<Review>;

  constructor(rating: number, reviews: RestPage<Review>) {
    this.rating = rating;
    this.reviews = reviews;
  }
}
