export class UserTutorial {
  tutorial: UserTutorial.Tutorial;

  constructor(tutorial: UserTutorial.Tutorial) {
    this.tutorial = tutorial;
  }
}

export namespace UserTutorial {
  export enum Tutorial {
    COVERAGE = 'COVERAGE',
    BILLING = 'BILLING',
  }
}
