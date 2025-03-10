import { Project } from '../api/models/Project';
import { ProjectRequest } from '../api/models/ProjectRequest';
import { Centroid } from '../api/models/ZipBoundaries';
import { removePhoneMask } from "../util/functions";

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
  image?: string;
  services?: ServiceType [];
}

export class NameIdImageTuple {
  id: number;
  name: string;
  image: string;
}

export class ServiceType {
  id: number;
  tradeId?: number
  name: string;
  description?: string;
  image?: string;
}

export class OfferedServiceType {
  id: number;
  name: string;
  enabled: boolean;
  tradeId: number;
  leadPrice?: number;
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

export class CompanyReviewCapability {
  notReviewedProjectRequests: Array<CompanyProjectRequest>;
  canLeftReview: boolean;
}

export class CompanyProjectRequest {
  id: number;
  company: any;
  contractor: any;
  status: ProjectRequest.Status;
  isReviewed: boolean;
  projectStatus: Project.Status;
  unreadMessages: number;
  projectCoverUrl?: string;
  serviceType?: string;
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
  reviewRequested: boolean;
  reviewed: boolean;
  unreadMessages: number;
}

export class ReviewRequestOption {
  available: number;
  completed: number;
}

export class ContractorProject extends ContractorProjectShort {
  location: Location;
  startDate: string;
  notes: string;
  details: ProjectDetail[];
}


export class UserInfo {
  id: any;
  name: string;
  iconUrl: string;
  email: string;
  phone: string;
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
  title: string;
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
  email: string;
  founded: string;
  siteUrl: string;
  licenses: any[];
  rating: number;
  deleted: boolean;
  approved: boolean;
  reviewCount: number;
}

export class CompanyProfile extends CompanyInfo {
  yearsInBusiness: number;
  trades: string[];
  services: string[];
  owner: boolean;
}


export class DemoProject {
  id?: number;
  name: string;
  images?: string[] = [];
  coverUrl?: string;
  description: string;
  date: string;
  price?: number;
  serviceTypes?: any[] = [];
  location?: Location = new Location();

  constructor(name?: string, images: string[] = [], coverUrl?: string, description?: string, date?: string, price?: number, serviceTypes: any[] = [], location: Location = new Location()) {
    this.name = name;
    this.images = images;
    this.coverUrl = coverUrl;
    this.description = description;
    this.date = date;
    this.price = price;
    this.serviceTypes = serviceTypes;
    this.location = location;
  }

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

export class ShortLead {
  id: number;
  created: string;
  location: Location;
  price: number;
  serviceType: string;
  centroid: Centroid;
  inCoverage: boolean;
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


  constructor(state?: string, city?: string, streetAddress?: string, zip?: string, lat?: number, lng?: number) {
    this.state = state;
    this.city = city;
    this.streetAddress = streetAddress;
    this.zip = zip;
    this.lat = lat;
    this.lng = lng;
  }
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

export class BaseLeadInfo {
  startExpectation: string;
  notes: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  constructor(info, startExpectation, projectDetails) {
    this.startExpectation = startExpectation;
    this.notes = projectDetails;
    this.firstName = info.firstName;
    this.lastName = info.lastName;
    this.email = info.email;
    this.phone = removePhoneMask(info.phone);
  }
}

export class UserAddress {
  streetAddress: string;
  city: string;
  state: string;
  zip: string
  isAddressManual: boolean;

  constructor(location: Location, isAddressManual: boolean) {
    this.streetAddress = location.streetAddress;
    this.city = location.city;
    this.state = location.state;
    this.zip = location.zip;
    this.isAddressManual = isAddressManual;
  }
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
