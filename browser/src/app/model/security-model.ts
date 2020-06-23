import { Location, OfferedServiceType, Trade } from './data-model';

export class Credentials {
  email: string;
  password: string;
  captcha: string;

  constructor(email?, password?, captcha?) {
    this.email = email;
    this.password = password;
    this.captcha = captcha;
  }
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

export namespace Role {
  export function getStaff() {
    return [Role.ADMIN, Role.SUPPORT]
  }
}

export class RegistrationUserModelBase {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  zip?: string;
  phone?: string;
  role?: string;
  referralCode?: string;
}

export class RegistrationUserModel extends RegistrationUserModelBase {
  captcha: string;
}

export class RegistrationUserProps {
  confirmPassword: string;
  agree?: boolean;
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

export class SocialUserInfo {
  accessToken: string;
  email: string;
  phone: string;
  referralCode: string;

  constructor(accessToken?: string, email?: string, phone?: string, referralCode?: string) {
    this.accessToken = accessToken;
    this.email = email;
    this.phone = phone;
    this.referralCode = referralCode;
  }
}

export class AdditionalUserInfo {
  email: string;
  phone: string;
  constructor(email?: string, phone?: string) {
    this.email = email;
    this.phone = phone;
  }
}
