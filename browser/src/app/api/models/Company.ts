import { Location } from '../../model/data-model';
import { Billing } from "./Billing";
import { AdminContractor } from "./AdminContractor";

export class Company {
  backgroundUrl?: any;
  billing?: Billing;
  description?: string;
  email?: string;
  founded?: number;
  iconUrl?: string;
  id?: string;
  internalPhone?: any;
  licenses?: any;
  location?: Location;
  isDeleted: boolean;
  name?: string;
  rating?: number;
  reviewCount?: number;
  sumRating: number;
  siteUrl?: string;
  isApproved: boolean;
  contractors?: AdminContractor[]
}
