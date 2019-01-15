export class UnavailabilityPeriod {
  id?: number;
  fromDate: string;
  tillDate: string;
  reason: string;
}

export namespace UnavailabilityPeriod {
  export enum Reason {
    TOO_BUSY = 'Too busy',
    OUT_OF_TOWN = 'Out of town',
    VACATION = 'Vacation',
    DAY_OFF = 'Day off',
    SICKNESS = 'Sickness',
    NOT_ACCEPTING_PROJECTS = 'Not accepting projects',
    OTHER = 'Other'
  }
}
