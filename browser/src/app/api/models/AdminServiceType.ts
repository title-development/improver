import { Trade } from '../../model/data-model';

export class AdminServiceType {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  labels: Array<string>;
  leadPrice: number;
  questionaryId: number;
  trades: Array<Trade>;

  constructor(name: string, description: string, imageUrl: string, isActive: boolean, labels: Array<string>, leadPrice: number, questionaryId: number, trades: Array<Trade>) {
    this.name = name;
    this.description = description;
    this.imageUrl = imageUrl;
    this.isActive = isActive;
    this.labels = labels;
    this.leadPrice = leadPrice;
    this.questionaryId = questionaryId;
    this.trades = trades;
  }
}
