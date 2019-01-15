export class Statistic {
  amount: number;
  created: string;
  type: string;
  name: string;
}

export namespace Statistic {
  export enum Period {
    HALF_YEAR = 'HALF_YEAR',
    MONTH = 'MONTH',
    WEEK = 'WEEK',
  }
  export enum PeriodCount {
    HALF_YEAR = 6,
    MONTH = 30,
    WEEK = 7
  }
}
