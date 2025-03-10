import { CustomerProjectShort, Location, ProjectDetail, UserInfo } from '../../model/data-model';
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
  reasonDescription: string;
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
  hasProjectRequests: boolean;
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
    OUTDATED = 'OUTDATED',
    INVALID_LOCATION = 'INVALID_LOCATION',
    INVALID_USER = 'INVALID_USER',
    INVALID_SERVICE = 'INVALID_SERVICE'
  }

  export enum SystemReason {
    DUPLICATED = 'DUPLICATED',
    OUTDATED = 'OUTDATED',
    INVALID_LOCATION = 'INVALID_LOCATION',
    INVALID_USER = 'INVALID_USER',
    INVALID_SERVICE = 'INVALID_SERVICE'
  }

  export enum Status {
    UNCOMPLETED = 'UNCOMPLETED',
    PENDING = 'PENDING',
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

  export function isActive(status: Project.Status) {
    return status === Status.ACTIVE || status === Status.IN_PROGRESS || status === Status.VALIDATION || status === Status.PENDING;
  }

  export class ValidationRequest {
    reason?: Reason;
    status?: Status;
    comment?: string
  }

  export function moveHiredContractorsToFirstPosition(projects: CustomerProjectShort[]) {
    for (let project of projects) {
      if (project.projectRequests.length === 0) continue;
      let index = project.projectRequests.findIndex(projectRequest =>
        ProjectRequest.isHiredOrCompleted(projectRequest.status));
      if (index < 0) continue;
      let hired = project.projectRequests[index];
      project.projectRequests.splice(index,1);
      project.projectRequests.unshift(hired);
    }
  }

}


