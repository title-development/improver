import { ProjectDetail, UserInfo } from '../../model/data-model';
import { ProjectRequest } from './ProjectRequest';
import { ProjectAction } from './ProjectAction';

export class Project {
  id: number;
  serviceType: string;
  customer: UserInfo;
  location: Location;
  created: string;
  updated: string;
  status: Project.Status;
  reason: Project.Reason;
  projectActions: ProjectAction;
  freePositions: number;
  lead: boolean;
  leadPrice: number;
  comments: string;
  startDate: string;
  notes: string;
  details: Array<ProjectDetail>;
  images: Array<string>;
  projectRequests: Array<ProjectRequest>;
}

export namespace Project {

  export enum Reason {
    DONE = 'Done by Pro',
    TOO_EXPENSIVE = 'The Project is too expensive',
    EVALUATING = 'I\'m still evaluating the project',
    HIRE_OTHER = 'I hired someone else',
    DO_MYSELF = 'I\'m doing the work myself',
    ESTIMATED = 'I only wanted estimates',
    OTHER = 'Other, please specify',

    DUPLICATED = 'DUPLICATED',
    INVALID_LOCATION = 'INVALID_LOCATION',
    INVALID_USER = 'INVALID_USER',
    INVALID_SERVICE = 'INVALID_SERVICE'
  }

  export enum SystemReason {
    DUPLICATED = 'DUPLICATED',
    INVALID_LOCATION = 'INVALID_LOCATION',
    INVALID_USER = 'INVALID_USER',
    INVALID_SERVICE = 'INVALID_SERVICE'
  }

  export enum Status {
    VALIDATION = 'VALIDATION',
    ACTIVE = 'ACTIVE',
    INVALID = 'INVALID',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELED = 'CANCELED'
  }

  export function isArchived(status: Project.Status) {
    return status === Status.COMPLETED || status === Status.CANCELED || status === Status.INVALID;
  }

  export class ValidationRequest {
    reason?: Reason;
    resolution?: Status;
    comment?: string
  }

}


