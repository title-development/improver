import { OfferedServiceType, Trade, Location } from './data-model';

export class Credentials {
  email: string;
  password: string;
}

export class LoginModel {
  id: string;
  name: string;
  role: Role;
  company: string;
  iconUrl: string;
}

export enum Role {
  ADMIN = 'ADMIN',
  SUPPORT = 'SUPPORT',
  MANAGER = 'MANAGER',
  STAKEHOLDER = 'STAKEHOLDER',
  CUSTOMER = 'CUSTOMER',
  CONTRACTOR = 'CONTRACTOR',
  ANONYMOUS = 'ANONYMOUS',
  INCOMPLETE_PRO = 'INCOMPLETE_PRO'
}

export class RegistrationUserModel {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  zip?: string;
  phone?: string;
  role?: string;
}

export class RegistrationUserProps {
  confirmPassword: string;
  agree?: boolean;
  reCaptcha?: boolean;
}

export class CompanyInfoRegistration {
  name: string;
  uriName?: string;
  founded: string;
  siteUrl: string;
  email: string;
  phone: string;
  description: string;
  location: Location;
  logo: string;
}

export class CompanyRegistration {
  company: CompanyInfoRegistration;
  tradesAndServices: {
    trades: Trade[],
    services: OfferedServiceType[]
  };
  coverage: {
    center: {
      lat: number,
      lng: number
    },
    radius: number
  };

}

export class ActivationCustomerModel {
  token: string;
  password?: string;
}
