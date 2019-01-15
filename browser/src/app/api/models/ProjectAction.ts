export class ProjectAction {
  id: number;
  author: string;
  text: string;
  action: ProjectAction.Action;
  created: string;
}

export namespace ProjectAction {
  export enum Action {
    COMMENT = 'COMMENT',
    UPDATE_LOCATION = 'UPDATE_LOCATION',
    VALIDATE = 'VALIDATE',
    INVALIDATE = 'INVALIDATE'
  }
}
