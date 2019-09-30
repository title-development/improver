import { Location } from '../../model/data-model';
import { Billing } from "./Billing";

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
  deleted: boolean;
  name?: string;
  rating?: number;
  reviewCount?: number;
  sumRating: number;
  uri: null;
  siteUrl?: string;
  approved: boolean;
}
