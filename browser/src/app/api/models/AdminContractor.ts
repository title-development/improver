import { Company } from './Company';
import { User } from './User';

export class AdminContractor extends User {
  quickReply: boolean;
  company: Company;
}
