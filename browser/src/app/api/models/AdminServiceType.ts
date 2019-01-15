import { Trade } from '../../model/data-model';

export class AdminServiceType {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  active: boolean;
  rating: number;
  labels: Array<string>;
  leadPrice: number;
  questionaryId: number;
  trades: Array<Trade>;

  constructor(name: string, description: string, imageUrl: string, active: boolean, rating: number, labels: Array<string>, leadPrice: number, questionaryId: number, trades: Array<Trade>) {
    this.name = name;
    this.description = description;
    this.imageUrl = imageUrl;
    this.active = active;
    this.rating = rating;
    this.labels = labels;
    this.leadPrice = leadPrice;
    this.questionaryId = questionaryId;
    this.trades = trades;
  }
}
