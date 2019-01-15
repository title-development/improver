export interface DetailedMonthReport {
  deals?: number;
  month?: string;
  payAndGoSpend?: number;
  payAndGoDeals?: number;
  subscriptionAmount?: number;
  subscriptionSpend?: number;
  subscriptionDeals?: number;
}

export interface MonthReport {
  deals: number;
  month: string;
  spend: number;
}

export class LeadsReport {
  current?: DetailedMonthReport;
  past?: Array<MonthReport>;
}
