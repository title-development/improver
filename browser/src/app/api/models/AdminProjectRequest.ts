import { UserInfo } from '../../model/data-model';
import { Project } from './Project';
import { Refund } from './Refund';
import { ProjectRequest } from './ProjectRequest';

export class AdminProjectRequest {
  id: number;
  status: ProjectRequest.Status;
  reason: ProjectRequest.Reason;
  reasonComment: string;
  manual: boolean;
  projectId: number;
  serviceType: string;
  projectStatus: Project.Status;
  refund: boolean;
  contractor: UserInfo;
  customer: UserInfo;
  created: string;
  updated: string;
}
