export const SECOND = 1000;
export const TWO_SECONDS = 2000;
export const THREE_SECONDS = 3000;
export const FIVE_SECONDS = 5000;
export const TEN_SECONDS = 10000;
export const TWENTY_SECONDS = 20000;
export const THIRTY_SECONDS = 30000;
export const WRONG_EMAIL_PASSWORD_MESSAGE = "Email or password is incorrect";

export const successTitle = {
  registeredUser: "We've sent an email to you."
};

export const errorMessages = {
  firstNameError: {
    emptyField: 'First name is required',
    tooShort: 'First name is too short',
    notValid: "May contain only letters, numbers and characters: ' -"
  },
  lastNameError: {
    emptyField: 'Last name is required',
    tooShort: 'Last name is too short',
    notValid: "May contain only letters, numbers and characters: ' -"
  },
  emailError: {
    emptyField: 'Email is required',
    notValid: 'Email is not valid',
    emailRegistered: 'Email is already registered'
  },
  phoneError: {
    emptyField: 'Phone number is required',
    notValid: 'Phone number format should be xxx-xxx-xxxx',
  },
  passwordError: {
    emptyField: 'Password is required',
    tooShort: 'Should contain 8 symbols',
    notValid: 'Should contain letters and numbers',
  },
  confirmPasswordError: {
    emptyField: 'Password confirmation is required',
    passwordMismatch: 'Password mismatch',
  }
};

export const questionaryAnonymousLastStep = {
  header: "One more step to go",
  button: "Ok"
};

export const mainSlogan = "Get Your Home Improvement Project Underway, the Right Way!";

export const pageTitle = {
  signUp: "Sign up to hire Professionals",
  userInformation: "User information",
  socialConnections: "Login option",
  company: "Company",
  services: "Provided Services",
  serviceArea: "Service Area",
  billing: "Billing",
  notificationSettings: "Notification Settings",
  autoReplay: "Auto Reply",
  scheduling: "Vacation Schedule"
};

export const menuLinkText = {
  leadPreferences: 'Lead Preferences',
  serviceArea: 'Service Area',
  notifications: 'Notifications',
  messagingAndNotifications: 'Messaging & Notifications',
  scheduling: 'Scheduling'
};
export const headerLinkText = {
  dashboard: 'Dashboard',
  profile: 'Profile'
};
export const pageLink = {
  dashboard: "/pro/dashboard",
  billing: '/pro/settings/billing'
};
export const dashboardCurrentUrlPattern = "^https://localhost:[0-9]{4}/pro/dashboard#";

export const billingHints = {
  balanceHeader: "Balance:",
  noAddedPaymentCardHeader: "Please add a credit/debit card to finish your account setup",
  accountBilledTo: "Account is billed to",
  setAmountToReplenish: "Please set an amount of money you want to top up your balance.\nThis is a one time charge.",
};

export const signUpProHints = {
  email: "Create a PRO account and continue company registration whenever suits you.",
  companyLogo: "Add a company logo or picture. Profiles with a picture bring up to 300% more customers.",
  coverageCommon: "Service Area is the area you work and receive leads. Basic area highlights a round area with radius of 10 miles and your company in the center. The zip codes that intersect with that area will be selected.",
  coverageRadius: "You can adjust the center of your service area by dragging it elsewhere.",
  offeredServices: "Select services you offer and want to receive leads for. You can always change offered services in your account settings.",
  businessCategories: "Services are grouped into Trades for easier configuration. Add the entire Trades or select particular Services.",
  checkService: "Please check any Service that applies to you"
};

export const phoneValidationCode = "1111";
