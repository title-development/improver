export class StaffAction {
  id?: number;
  author?: string;
  description?: string;
  created?: string;
}

export namespace StaffAction {
  export enum Action {
    CREATE_INVITATION = 'CREATE_INVITATION',
    ADD_BONUS = 'ADD_BONUS',
  }
}
