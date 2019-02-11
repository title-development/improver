
import { Project } from '../api/models/Project';
import { ProjectRequest } from '../api/models/ProjectRequest';

/*************************************************
 ******************    Enums   *******************
 ************************************************/

export enum State {
  AL = 'Alabama',
  AK = 'Alaska',
  AZ = 'Arizona',
  AR = 'Arkansas',
  CA = 'California',
  CO = 'Colorado',
  CT = 'Connecticut',
  DE = 'Delaware',
  FL = 'Florida',
  GA = 'Georgia',
  HI = 'Hawaii',
  ID = 'Idaho',
  IL = 'Illinois',
  IN = 'Indiana',
  IA = 'Iowa',
  KS = 'Kansas',
  KY = 'Kentucky',
  LA = 'Louisiana',
  ME = 'Maine',
  MD = 'Maryland',
  MA = 'Massachusetts',
  MI = 'Michigan',
  MN = 'Minnesota',
  MS = 'Mississippi',
  MO = 'Missouri',
  MT = 'Montana',
  NE = 'Nebraska',
  NV = 'Nevada',
  NH = 'New Hampshire',
  NJ = 'New Jersey',
  NM = 'New Mexico',
  NY = 'New York',
  NC = 'North Carolina',
  ND = 'North Dakota',
  OH = 'Ohio',
  OK = 'Oklahoma',
  OR = 'Oregon',
  PA = 'Pennsylvania',
  RI = 'Rhode Island',
  SC = 'South Carolina',
  SD = 'South Dakota',
  TN = 'Tennessee',
  TX = 'Texas',
  UT = 'Utah',
  VT = 'Vermont',
  VA = 'Virginia',
  WA = 'Washington',
  WV = 'West Virginia',
  WI = 'Wisconsin',
  WY = 'Wyoming',
  DC = 'District of Columbia'
}

export namespace State {
  export function isSupported(state: State) {
    switch (state) {
      case State.NY:
      case State.NJ:
      case State.CO:
      case State.MA:
        return true;

      default :
        return false;
    }
  }
}

export enum SystemMessageType {
  SUCCESS = 'SUCCESS',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export enum Accreditation {
  AIR_MONITORING = 'Air Monitoring',
  ARCHITECTURE = 'Architecture',
  ASBESTOS_ABATEMENT_CONTRACTOR = 'Asbestos Abatement Contractor',
  ENGINEERING = 'Engineering',
  HOME_INSPECTOR = 'Home Inspector',
  INSPECTION = 'Inspection',
  INTERIOR_DESIGN = 'Interior Design',
  LAND_SURVEYING = 'Land Surveying',
  LANDSCAPE_ARCHITECTURE = 'Landscape Architecture',
  MANAGEMENT_PLANNING = 'Management Planning',
  MONITORING = 'Monitoring',
  PROFESSIONAL_ENGINEERING = 'Professional Engineering',
  PROJECT_DESIGNER = 'Project Designer',
  SURVEYING = 'Surveying',
  WATER_WELL_CONTRACTOR = 'Water Well Contractor'
}

/*************************************************
 *******************   Models   ******************
 ************************************************/
export class Trade {
  id: number;
  name: string;
  serviceTypes?: ServiceType [];
  services?: ServiceType [];
}

export class ServiceType {
  id: number;
  name: string;
  description?: string;
  rating?: number;
  image?: string;
}

export class OfferedServiceType {
  id: number;
  name: string;
  enabled: boolean;
  parentId: number;
}

export class TradesAndServiceTypes {
  trades: Trade [];
  services: OfferedServiceType[];
}

export class Field {
  id: number;
  name: string;
  allowsMultipleValues: boolean;
  numericValue: boolean;
  possibleValues: PossibleValue [];
  required: boolean;
  withImage: boolean;
}

export class PossibleValue {
  id: number;
  label: string;
  field: number;
  image: string;
  priceMultiplier: number;
  priceValue: number;
}

export class Customer {
  id: number;
  email: string;
  password: string;
  fullName: string;
  Phone: string;
  zipCode: string;
}

export class Geolocation {
  ip: string;
  city: string;
  latitude: string;
  longitude: string;
  postal: string;
  subdivision: string;
}

export class CustomerProjectShort {
  id: any;
  serviceType: string;
  status: Project.Status;
  created: string;
  coverUrl: string;
  projectRequests: ProjectRequest[];
  unreadMessages: number;

  constructor() {
  }
}

export class CustomerProject extends CustomerProjectShort {
  location: Location;
  startDate: string;
  notes: string;
  details: Array<ProjectDetail>;
  images: Array<string>;

  constructor() {
    super();
  }

  isArchived(): boolean {
    return this.status === Project.Status.CANCELED || this.status === Project.Status.COMPLETED || this.status === Project.Status.INVALID;
  }
}


export class ContractorProjectShort {
  id: any;
  projectId: any;
  customer: UserInfo;
  serviceType: string;
  status: ProjectRequest.Status;
  created: string;
  updated: string;
  refundable: boolean;
  refundRequested: boolean;
  manual: boolean;
  projectStatus: Project.Status;
  images: string[];
  unreadMessages: number;
}

export class ContractorProject extends ContractorProjectShort {
  location: Location;
  startDate: string;
  notes: string;
  details: string;
}


export class UserInfo {
  id: any;
  name: string;
  iconUrl: string;
  phone: string;
  pin: string;
  email: string;
}

export class CloseProjectVariant {
  cancelVariants: {};
  completeVariants: {};
  projectRequests: [
    {
      id: any,
      image: string,
      name: string
    }
    ];
}

export class CloseProjectRequest {
  action?: string;
  comment?: string;
  projectRequestId?: number = 0;
  reason?: string;

}

export class Review {
  id?: any;
  created?: string;
  customer?: UserInfo;
  description?: string;
  company?: CompanyInfo;
  score?: number;
  publishDate?: number;
  revisionRequested?: boolean;
  published?: boolean;
  revisionComment?: string;
  serviceName?: string;
}

export class ReviewRevisionRequest {
  id?: any;
  created?: string;
  comment?: string;
  reviewId?: any;
  declined: boolean;
}

export class ProjectDetail {
  name: string;
  results: string[];
}

export class Account {
  id: number;
  iconUrl: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  nativeUser?: boolean;
}

export class CompanyInfo {
  id: string;
  uriName: string;
  iconUrl: string;
  backgroundUrl: string;
  name: string;
  description: string;
  location: Location;
  phone: string;
  pin: string;
  email: string;
  founded: string;
  siteUrl: string;
  licenses: any[];
  rating: number;
  deleted: number;
  approved: boolean;
  reviewCount: number;
}

export class CompanyProfile extends CompanyInfo {
  pin: string;
  medianProjectCost: number;
  yearsInBusiness: number;
  trades: string[];
  services: string[];
  licenses: any[];
  owner: boolean;
  subscribed: boolean;
}

// TODO: Fix model
export class GalleryProject {
  id?: number;
  name?: string;
  image?: string;
  images?: string[];
  coverUrl?: string;
  description?: string;
  date?: string;
  price?: string;
  serviceTypes?: any[];
  location?: Location;
}

export class Lead {
  id: string;
  serviceType: string;
  location: Location;
  created: string;
  price: number;
  clientName: string;
  notes: string;
  startDate: string;
  inCoverage: boolean;
  details: ProjectDetail[];
}

export class GoogleMapMarker {
  lat: number;
  lng: number;
  leadIndex: number;
  leadId: string;
}

export class NameId {
  id: number;
  name: string;
}

export class Location {
  state?: string;
  city?: string;
  streetAddress?: string;
  zip?: string;
  lat?: number;
  lng?: number;
}

// TODO: fix model
export class PaymentCard {
  id: any;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  selected: boolean;
  icon?: string;
}

export class LicenseType {
  id?: string;
  state: string;
  accreditation: string;
  constructor(state = 'AL', accreditation = '') {
    this.state = state;
    this.accreditation = accreditation;
  }
}

export class License {
  id?: string;
  state: string;
  accreditation: string;
  number: string;
  expired: string;
}

export class PopUpMessage {
  id?: any;
  text?: string;
  type?: SystemMessageType;
  timeout?: number;
}

export class Statistic {
  current: any;
  past: any;
}

export class StripeToken {
  id?: string;
  clientIp: string;
  created: number;
}

export class Pagination {
  page: any;
  size: any;
  sort?: any;

  constructor(page: any = 0, size: any = 10, sort: any = '') {
    this.page = page;
    this.size = size;
    this.sort = sort;
  }

  fromPrimeNg(primeEvent): Pagination {
    this.page = primeEvent.first / primeEvent.rows;
    this.size = primeEvent.rows;
    const sortOrder = primeEvent.sortOrder > 0 ? 'ASC' : 'DESC';
    if (primeEvent.sortField) {
      this.sort = `${primeEvent.sortField},${sortOrder}`;
    }
    return this;
  }

  nextPage(): Pagination {
    this.page += 1;

    return this;
  }

}

export class OldNewValue {
  oldValue: any;
  newValue: any;

  constructor(oldValue: any, newValue: any) {
    this.oldValue = oldValue;
    this.newValue = newValue;
  }
}
